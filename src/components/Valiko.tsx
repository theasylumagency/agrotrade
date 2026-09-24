"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { brandByKey } from "@/lib/brands";
import { gel, imgS, type Product } from "@/lib/catalog";
import { useCatalog, useProposal } from "./ProposalContext";

type Msg = { role: "user" | "assistant"; content: string };
type Lead = { need?: string; area?: string | null; crop?: string | null; budget?: string | null; payment?: string | null; products?: number[]; urgency?: string; next?: string; summary?: string };

const SUGGEST = [
  "30 სოტკა ბოსტანი მაქვს. რა მჭირდება?",
  "7 თუ 9 ცხენის ძალა — რა განსხვავებაა?",
  "მოტობლოკი მინდა 1500 ლარამდე",
  "1 ჰექტარი ვენახი მაქვს, რით შევწამლო?",
  "განვადებით შემიძლია?",
  "სად არის თქვენი მაღაზიები?",
];

const TOKEN = /\[\[#(\d+)\]\]/g;

export default function Valiko() {
  const { concept } = useProposal();
  const brand = brandByKey(concept);
  const secRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const catalog = useCatalog(near);
  const byId = new Map((catalog?.items ?? []).map((p) => [p.id, p]));
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("");
  const [lead, setLead] = useState<Lead | null>(null);
  const [leadBusy, setLeadBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef<Msg[]>([]);
  msgsRef.current = msgs;
  const busyRef = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    if (secRef.current) io.observe(secRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, lead]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setDraft("");
    setLead(null);
    const next: Msg[] = [...msgsRef.current, { role: "user", content: t }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/valiko", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next, brand: brand.latin }) });
      setMode(res.headers.get("x-valiko") ?? "");
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
      if (!acc.trim()) setMsgs([...next, { role: "assistant", content: "ბოდიში, ხაზი გამიწყდა. კიდევ ერთხელ მკითხე?" }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "ბოდიში, ახლა კავშირი ვერ დავამყარე. ცოტა ხანში კიდევ სცადე." }]);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  useEffect(() => {
    const on = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      setNear(true);
      secRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => send(text), 650);
    };
    window.addEventListener("valiko:ask", on);
    return () => window.removeEventListener("valiko:ask", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept]);

  const makeLead = async () => {
    setLeadBusy(true);
    try {
      const res = await fetch("/api/valiko", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: msgs, brand: brand.latin, mode: "lead" }) });
      setLead(await res.json());
    } catch {
      setLead({ summary: "ლიდი ვერ შეიქმნა — სცადეთ თავიდან." });
    } finally {
      setLeadBusy(false);
    }
  };

  const userTurns = msgs.filter((m) => m.role === "user").length;
  const d = new Date();
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  return (
    <section className="valiko-section" id="valiko" ref={secRef}>
      <div className="wrap valiko-grid">
        <div className="valiko-side" data-reveal>
          <span className="kicker">05 / ვალიკო AI — ცოცხლად</span>
          <h2 className="display">ჰკითხეთ<br /><em>ვალიკოს.</em></h2>
          <p className="lead">ეს არ არის წინასწარ დაწერილი სცენარი. ვალიკო იცნობს აგრო თრეიდის 217-ვე პროდუქტს — ფასს, სიმძლავრეს, მარაგს, განვადებას და მაღაზიებს. დაუსვით ნებისმიერი კითხვა, ისე როგორც თქვენი მყიდველი დაუსვამდა.</p>
          <div className="valiko-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/valiko-concept.webp" alt="ვალიკო AI — პერსონაჟის ვიზუალური კონცეფცია" />
            <div>
              <b>ვალიკო</b>
              <span><i className="live" /> AI აგრო-მრჩეველი · {brand.latin}</span>
            </div>
          </div>
          <ul className="valiko-roles">
            <li><b>საკუთარი არხები</b><span>Facebook და TikTok — ხსნის, ადარებს, აგროვებს აუდიტორიას.</span></li>
            <li><b>გაყიდვების გვერდები</b><span>ახალი ბრენდის ექსპერტი ლენდინგებსა და კამპანიებში.</span></li>
            <li><b>ჩატი 24/7</b><span>არჩევაში ეხმარება და მზა ლიდს გადასცემს გაყიდვების გუნდს.</span></li>
          </ul>
        </div>

        <div className="chat" data-reveal data-mode={mode}>
          <div className="chat-top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/valiko-concept.webp" alt="" />
            <div><b>ვალიკო</b><span>{busy ? "წერს…" : "ონლაინ"}</span></div>
            <span className="chat-brand">{brand.domain}</span>
          </div>
          <div className="chat-log" ref={logRef} aria-live="polite">
            <div className="bubble bot">გაუმარჯოს! ვალიკო ვარ. მითხარი რა გაქვს — ბოსტანი, ბაღი თუ მინდორი, და რამდენი სოტკა? ზუსტად იმას შეგირჩევ, რაც გჭირდება. არაფერს ზედმეტს.</div>
            {msgs.map((m, i) => (
              <Fragment key={i}>
                <div className={`bubble ${m.role === "user" ? "me" : "bot"} ${m.role === "assistant" && busy && i === msgs.length - 1 ? "typing" : ""}`}>
                  {m.role === "assistant" ? <Rich text={m.content} byId={byId} /> : m.content}
                  {m.role === "assistant" && !m.content && <span className="dots"><i /><i /><i /></span>}
                </div>
                {m.role === "assistant" && !(busy && i === msgs.length - 1) && <Cards text={m.content} byId={byId} />}
              </Fragment>
            ))}
            {lead && <LeadCard lead={lead} byId={byId} brand={brand.latin} time={time} />}
          </div>
          {!msgs.length && (
            <div className="chat-suggest">
              {SUGGEST.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
            </div>
          )}
          {userTurns >= 2 && !busy && !lead && (
            <button className="lead-btn" onClick={makeLead} disabled={leadBusy}>
              {leadBusy ? "ლიდი მზადდება…" : "✓ გადაეცი გაყიდვების გუნდს"}
            </button>
          )}
          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="დაწერეთ კითხვა ვალიკოს…" maxLength={600} aria-label="შეტყობინება ვალიკოს" />
            <button type="submit" disabled={busy || !draft.trim()} aria-label="გაგზავნა">↑</button>
          </form>
        </div>
      </div>

      <div className="wrap reels" data-reveal>
        <div className="reels-head">
          <span className="kicker">ვალიკოს არხები · კონტენტის კონცეფცია</span>
          <p>8–12 მოკლე ვიდეო თვეში. ვალიკო ხსნის, ადარებს და აჩვენებს — გაყიდვა მოდის ნდობიდან.</p>
        </div>
        <div className="reels-row">
          {[
            { id: 8816, hook: "7 თუ 9 ცხენის ძალა?", sub: "30 წამში აგიხსნი, რატომ არ უნდა გადაიხადო ზედმეტი." },
            { id: 8806, hook: "დიზელი თუ ბენზინი?", sub: "1 ჰექტარზე მეტზე — ვალიკოს პასუხი და გამოთვლა." },
            { id: 7196, hook: "სიმინდი → ფქვილი. სახლში.", sub: "რამდენ ხანში ამოიღებს ფულს წისქვილი?" },
          ].map((r) => (
            <div className="reel" key={r.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgS(r.id).replace("/s/", "/m/")} alt="" loading="lazy" />
              <div className="reel-top"><span>@valiko.ai</span><em>კონცეფცია</em></div>
              <div className="reel-bottom"><b>{r.hook}</b><span>{r.sub}</span></div>
              <div className="reel-side" aria-hidden="true"><i>♥</i><i>✎</i><i>↗</i></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Rich({ text, byId }: { text: string; byId: Map<number, Product> }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? (byId.has(Number(p)) ? <span key={i} className="ptok">↗</span> : null) : <Fragment key={i}>{p.replace(/\*\*/g, "")}</Fragment>))}
    </>
  );
}

function Cards({ text, byId }: { text: string; byId: Map<number, Product> }) {
  const ids = [...new Set([...text.matchAll(TOKEN)].map((m) => Number(m[1])))].filter((id) => byId.has(id)).slice(0, 3);
  if (!ids.length) return null;
  return (
    <div className="chat-cards">
      {ids.map((id) => {
        const p = byId.get(id)!;
        return (
          <a key={id} className="chat-card" href={p.u} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgS(id)} alt="" />
            <span>{p.n}</span>
            <b>{gel(p.p)}</b>
            <small>{p.st ? "მარაგშია" : "მარაგი ივსება"}</small>
          </a>
        );
      })}
    </div>
  );
}

function LeadCard({ lead, byId, brand, time }: { lead: Lead; byId: Map<number, Product>; brand: string; time: string }) {
  const rows: [string, string | null | undefined][] = [
    ["საჭიროება", lead.need],
    ["ფართობი", lead.area],
    ["კულტურა", lead.crop],
    ["ბიუჯეტი", lead.budget],
    ["გადახდა", lead.payment],
  ];
  return (
    <div className="lead-card">
      <div className="lead-head">
        <span className="lead-badge">ახალი ლიდი</span>
        <span>{brand} · ვალიკო ჩატი · {time}</span>
        {lead.urgency && <span className={`urg urg-${lead.urgency === "მაღალი" ? "hi" : lead.urgency === "საშუალო" ? "mid" : "lo"}`}>{lead.urgency}</span>}
      </div>
      {lead.summary && <p className="lead-sum">{lead.summary}</p>}
      <dl>
        {rows.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      {!!lead.products?.length && (
        <div className="lead-products">
          {lead.products.filter((id) => byId.has(id)).map((id) => (
            <span key={id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgS(id)} alt="" />
              {byId.get(id)!.n.split("–")[0].split("(")[0].trim()} · {gel(byId.get(id)!.p)}
            </span>
          ))}
        </div>
      )}
      {lead.next && <p className="lead-next"><b>შემდეგი ნაბიჯი:</b> {lead.next}</p>}
      <p className="lead-foot">ასე მიდის ლიდი გაყიდვების გუნდთან — CRM-ში, Telegram-ში ან ელფოსტაზე. ტელეფონის ნომერს მყიდველი ტოვებს ჩატში.</p>
    </div>
  );
}
