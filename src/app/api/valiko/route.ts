import dns from "node:dns";
import net from "node:net";
import { systemPrompt, LEAD_PROMPT } from "@/lib/valiko/knowledge";
import { fallbackLead, fallbackReply } from "@/lib/valiko/fallback";

/**
 * Valiko AI endpoint.
 * - ANTHROPIC_API_KEY  → Claude (model: VALIKO_MODEL, default "claude-sonnet-5")
 * - OPENAI_API_KEY     → OpenAI-compatible API (model: OPENAI_MODEL, base: OPENAI_BASE_URL)
 * - neither / provider error / timeout → built-in offline advisor, so the demo never hangs or breaks.
 *
 * Diagnostics: GET /api/valiko?diag=1 — shows whether the key is loaded and whether this server can reach the provider.
 */

export const maxDuration = 30;

// Servers with a broken IPv6 route hang when Node tries IPv6 first — prefer IPv4.
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* older Node */
}

const HEADERS_TIMEOUT = 12_000; // provider must start answering within this time
const IDLE_TIMEOUT = 20_000; // max silence inside a streaming answer

type Msg = { role: "user" | "assistant"; content: string };

const hits = new Map<string, number[]>();
function limited(ip: string, max = 40) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}

function clean(input: unknown): Msg[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((m): m is Msg => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-14);
}

const enc = new TextEncoder();
const env = (k: string) => process.env[k]?.trim().replace(/^["']|["']$/g, "") || "";
const provider = () => (env("ANTHROPIC_API_KEY") ? "anthropic" : env("OPENAI_API_KEY") ? "openai" : null);

function textStream(text: string, delay = 16) {
  const parts = text.match(/\S+\s*|\s+/g) ?? [text];
  return new ReadableStream<Uint8Array>({
    async start(c) {
      for (const p of parts) {
        c.enqueue(enc.encode(p));
        await new Promise((r) => setTimeout(r, delay + Math.random() * 22));
      }
      c.close();
    },
  });
}

function sseStream(res: Response, pick: (json: unknown) => string | null, abort: AbortController) {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";
  return new ReadableStream<Uint8Array>({
    // IMPORTANT: pull() must enqueue at least one chunk (or close) before resolving.
    // Providers send non-text events first (Anthropic: message_start, content_block_start, ping);
    // a pull() that resolves without enqueueing is never called again and the response hangs forever.
    async pull(c) {
      for (;;) {
        const idle = setTimeout(() => abort.abort(), IDLE_TIMEOUT);
        let chunk: ReadableStreamReadResult<Uint8Array>;
        try {
          chunk = await reader.read();
        } catch {
          c.close();
          return;
        } finally {
          clearTimeout(idle);
        }
        if (chunk.done) {
          c.close();
          return;
        }
        buf += dec.decode(chunk.value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        let pushed = false;
        for (const line of lines) {
          const l = line.trim();
          if (!l.startsWith("data:")) continue;
          const data = l.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const t = pick(JSON.parse(data));
            if (t) {
              c.enqueue(enc.encode(t));
              pushed = true;
            }
          } catch {
            /* ignore keep-alives */
          }
        }
        if (pushed) return;
      }
    },
    cancel() {
      abort.abort();
    },
  });
}

async function callProvider(system: string, messages: Msg[], stream: boolean, maxTokens: number, abort: AbortController) {
  // streaming answers start within seconds; non-streaming ones arrive only when complete
  const timer = setTimeout(() => abort.abort(), stream ? HEADERS_TIMEOUT : 25_000);
  try {
    if (provider() === "anthropic") {
      return await fetch(`${(env("ANTHROPIC_BASE_URL") || "https://api.anthropic.com").replace(/\/$/, "")}/v1/messages`, {
        method: "POST",
        signal: abort.signal,
        headers: { "x-api-key": env("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: env("VALIKO_MODEL") || "claude-sonnet-5",
          max_tokens: maxTokens,
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages,
          stream,
        }),
      });
    }
    const base = (env("OPENAI_BASE_URL") || "https://api.openai.com/v1").replace(/\/$/, "");
    return await fetch(`${base}/chat/completions`, {
      method: "POST",
      signal: abort.signal,
      headers: { authorization: `Bearer ${env("OPENAI_API_KEY")}`, "content-type": "application/json" },
      body: JSON.stringify({ model: env("OPENAI_MODEL") || "gpt-4.1-mini", max_completion_tokens: maxTokens, stream, messages: [{ role: "system", content: system }, ...messages] }),
    });
  } finally {
    clearTimeout(timer);
  }
}

const pickAnthropic = (j: unknown) => {
  const e = j as { type?: string; delta?: { type?: string; text?: string } };
  return e.type === "content_block_delta" && e.delta?.type === "text_delta" ? e.delta.text ?? null : null;
};
const pickOpenAI = (j: unknown) => (j as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content ?? null;

const headers = (mode: string, extra: Record<string, string> = {}) => ({
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "no-store",
  "x-accel-buffering": "no", // let nginx pass the stream through instead of buffering it
  "x-valiko": mode,
  ...extra,
});

const offline = (messages: Msg[], reason: string) => new Response(textStream(fallbackReply(messages)), { headers: headers("offline", { "x-valiko-reason": reason }) });

export async function POST(req: Request) {
  let body: { messages?: unknown; brand?: unknown; mode?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }
  const messages = clean(body.messages);
  if (!messages.length || messages[0].role !== "user") return new Response("bad request", { status: 400 });
  const brand = typeof body.brand === "string" ? body.brand.slice(0, 40) : "აგრო თრეიდი";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  const prov = provider();

  if (body.mode === "lead") {
    if (prov && !limited(ip)) {
      try {
        const transcript = messages.map((m) => `${m.role === "user" ? "მომხმარებელი" : "ვალიკო"}: ${m.content}`).join("\n");
        const res = await callProvider(LEAD_PROMPT, [{ role: "user", content: transcript }], false, 1500, new AbortController());
        if (res.ok) {
          const j = await res.json();
          const text: string = j?.content?.[0]?.text ?? j?.choices?.[0]?.message?.content ?? "";
          const m = text.match(/\{[\s\S]*\}/);
          if (m) return Response.json({ ...JSON.parse(m[0]), source: "ai" });
          console.error("valiko lead: no JSON in answer", text.slice(0, 200));
        } else console.error("valiko lead:", res.status, (await res.text().catch(() => "")).slice(0, 300));
      } catch (e) {
        console.error("valiko lead: provider error", e);
      }
    }
    return Response.json({ ...fallbackLead(messages), source: "offline" });
  }

  if (!prov) return offline(messages, "no-key");
  if (limited(ip)) return offline(messages, "rate-limit");

  const abort = new AbortController();
  try {
    const res = await callProvider(systemPrompt(brand), messages, true, 700, abort);
    if (res.ok && res.body) {
      return new Response(sseStream(res, prov === "anthropic" ? pickAnthropic : pickOpenAI, abort), { headers: headers("ai") });
    }
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    console.error(`valiko: ${prov} HTTP ${res.status}`, detail);
    return offline(messages, `http-${res.status}`);
  } catch (e) {
    const reason = abort.signal.aborted ? "timeout" : "network";
    console.error(`valiko: ${prov} ${reason}`, e);
    return offline(messages, reason);
  }
}

/* ---------------- diagnostics: GET /api/valiko?diag=1 ---------------- */

function tcp(host: string, family: 4 | 6, timeout = 5000) {
  return new Promise<{ ok: boolean; ms: number; error?: string }>((resolve) => {
    const t0 = Date.now();
    const s = net.connect({ host, port: 443, family, timeout });
    const done = (ok: boolean, error?: string) => {
      s.destroy();
      resolve({ ok, ms: Date.now() - t0, ...(error ? { error } : {}) });
    };
    s.on("connect", () => done(true));
    s.on("timeout", () => done(false, "timeout"));
    s.on("error", (e: NodeJS.ErrnoException) => done(false, e.code || e.message));
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!url.searchParams.has("diag")) return new Response("Valiko is here. POST only.", { status: 405 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip, 20)) return Response.json({ error: "rate-limited" }, { status: 429 });

  const prov = provider();
  const key = prov === "anthropic" ? env("ANTHROPIC_API_KEY") : prov === "openai" ? env("OPENAI_API_KEY") : "";
  const host = prov === "openai" ? new URL(env("OPENAI_BASE_URL") || "https://api.openai.com/v1").hostname : "api.anthropic.com";
  const out: Record<string, unknown> = {
    node: process.version,
    provider: prov ?? "none — ANTHROPIC_API_KEY / OPENAI_API_KEY not visible to the server process",
    key: prov ? { length: key.length, prefix: key.slice(0, 7), rawHadQuotesOrSpaces: (process.env[prov === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"] ?? "") !== key } : null,
    model: prov === "anthropic" ? env("VALIKO_MODEL") || "claude-sonnet-5" : prov === "openai" ? env("OPENAI_MODEL") || "gpt-4.1-mini" : null,
    host,
  };
  try {
    const [a4, a6] = await Promise.all([dns.promises.resolve4(host).catch((e) => e.code), dns.promises.resolve6(host).catch((e) => e.code)]);
    out.dns = { ipv4: a4, ipv6: a6 };
  } catch (e) {
    out.dns = String(e);
  }
  out.tcp = { ipv4: await tcp(host, 4), ipv6: await tcp(host, 6) };
  if (prov) {
    const t0 = Date.now();
    const abort = new AbortController();
    try {
      const res = await callProvider("Reply with the single word: OK", [{ role: "user", content: "ping" }], false, 5, abort);
      const text = await res.text();
      out.api = { status: res.status, ms: Date.now() - t0, ok: res.ok, body: text.slice(0, 400) };
    } catch (e) {
      out.api = { ok: false, ms: Date.now() - t0, error: abort.signal.aborted ? "no answer within 25s" : String((e as Error)?.cause ?? e) };
    }
    // the real chat path: full catalog prompt + streaming, read through the same parser the chat uses
    const t1 = Date.now();
    const abort2 = new AbortController();
    try {
      const res = await callProvider(systemPrompt("KVALI"), [{ role: "user", content: "გამარჯობა" }], true, 60, abort2);
      const headersMs = Date.now() - t1;
      if (!res.ok || !res.body) {
        out.chat = { ok: false, status: res.status, headersMs, body: (await res.text()).slice(0, 300) };
      } else {
        const r = sseStream(res, prov === "anthropic" ? pickAnthropic : pickOpenAI, abort2).getReader();
        const first = await r.read();
        const firstTextMs = Date.now() - t1;
        let sample = first.done ? "" : new TextDecoder().decode(first.value);
        for (let i = 0; i < 8; i++) {
          const n = await r.read();
          if (n.done) break;
          sample += new TextDecoder().decode(n.value);
        }
        r.cancel().catch(() => {});
        out.chat = { ok: !!sample, status: res.status, headersMs, firstTextMs, sample: sample.slice(0, 160) };
      }
    } catch (e) {
      out.chat = { ok: false, ms: Date.now() - t1, error: abort2.signal.aborted ? "timeout" : String((e as Error)?.cause ?? e) };
    }
  }
  return Response.json(out, { headers: { "cache-control": "no-store" } });
}
