import { systemPrompt, LEAD_PROMPT } from "@/lib/valiko/knowledge";
import { fallbackLead, fallbackReply } from "@/lib/valiko/fallback";

/**
 * Valiko AI endpoint.
 * - ANTHROPIC_API_KEY  → Claude (model: VALIKO_MODEL, default "claude-sonnet-5")
 * - OPENAI_API_KEY     → OpenAI-compatible API (model: OPENAI_MODEL, base: OPENAI_BASE_URL)
 * - neither / provider error → built-in offline advisor, so the demo never breaks.
 */

export const maxDuration = 30;

type Msg = { role: "user" | "assistant"; content: string };

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 40;
}

function clean(input: unknown): Msg[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((m): m is Msg => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }))
    .slice(-14);
}

const enc = new TextEncoder();

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

function sseStream(res: Response, pick: (json: unknown) => string | null) {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";
  return new ReadableStream<Uint8Array>({
    async pull(c) {
      const { done, value } = await reader.read();
      if (done) return c.close();
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const l = line.trim();
        if (!l.startsWith("data:")) continue;
        const data = l.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const t = pick(JSON.parse(data));
          if (t) c.enqueue(enc.encode(t));
        } catch {
          /* ignore keep-alives */
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}

async function anthropic(system: string, messages: Msg[], stream: boolean, maxTokens: number) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.VALIKO_MODEL || "claude-sonnet-5",
      max_tokens: maxTokens,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages,
      stream,
    }),
  });
}

async function openai(system: string, messages: Msg[], stream: boolean, maxTokens: number) {
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  return fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4.1-mini", max_tokens: maxTokens, stream, messages: [{ role: "system", content: system }, ...messages] }),
  });
}

const headers = (mode: string) => ({ "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-valiko": mode });

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
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const hasAI = !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY);

  if (body.mode === "lead") {
    if (hasAI && !limited(ip)) {
      try {
        const transcript = messages.map((m) => `${m.role === "user" ? "მომხმარებელი" : "ვალიკო"}: ${m.content}`).join("\n");
        const ask: Msg[] = [{ role: "user", content: transcript }];
        const res = process.env.ANTHROPIC_API_KEY ? await anthropic(LEAD_PROMPT, ask, false, 500) : await openai(LEAD_PROMPT, ask, false, 500);
        if (res.ok) {
          const j = await res.json();
          const text: string = j?.content?.[0]?.text ?? j?.choices?.[0]?.message?.content ?? "";
          const m = text.match(/\{[\s\S]*\}/);
          if (m) return Response.json({ ...JSON.parse(m[0]), source: "ai" });
        }
      } catch {
        /* fall through */
      }
    }
    return Response.json({ ...fallbackLead(messages), source: "offline" });
  }

  if (!hasAI || limited(ip)) return new Response(textStream(fallbackReply(messages)), { headers: headers("offline") });

  try {
    const sys = systemPrompt(brand);
    if (process.env.ANTHROPIC_API_KEY) {
      const res = await anthropic(sys, messages, true, 700);
      if (res.ok && res.body)
        return new Response(
          sseStream(res, (j) => {
            const e = j as { type?: string; delta?: { type?: string; text?: string } };
            return e.type === "content_block_delta" && e.delta?.type === "text_delta" ? e.delta.text ?? null : null;
          }),
          { headers: headers("ai") },
        );
      console.error("valiko: anthropic", res.status, await res.text().catch(() => ""));
    } else {
      const res = await openai(sys, messages, true, 700);
      if (res.ok && res.body)
        return new Response(
          sseStream(res, (j) => (j as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content ?? null),
          { headers: headers("ai") },
        );
      console.error("valiko: openai", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("valiko: provider error", e);
  }
  return new Response(textStream(fallbackReply(messages)), { headers: headers("offline") });
}
