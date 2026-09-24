"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { brandByKey, type BrandKey } from "@/lib/brands";
import { gel, imgS, type Product } from "@/lib/catalog";
import { BrandMark } from "./BrandMark";
import { nextOrderNo, useCatalog, useProposal, type OrderEvent } from "./ProposalContext";

const IDS = [8810, 8803, 8816, 8610, 8513];
const START_STOCK: Record<number, number> = { 8810: 6, 8803: 9, 8816: 14, 8610: 11, 8513: 3 };

type Row = { id: number; name: string; price: number; stock: number; live: boolean };
type Feed = { id: string; brand: BrandKey; text: string; total: number; sim: boolean; t: number };

export default function EngineDemo() {
  const { concept } = useProposal();
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const catalog = useCatalog(near);
  const [edits, setEdits] = useState<Record<number, Partial<Row>>>({});
  const [flash, setFlash] = useState<{ id: number; n: number } | null>(null);
  const [feed, setFeed] = useState<Feed[]>([]);
  const [sync, setSync] = useState(0);
  const seq = useRef(0);
  const base = useMemo<Row[]>(() => {
    if (!catalog) return [];
    const by = new Map(catalog.items.map((p) => [p.id, p]));
    return IDS.map((id) => by.get(id)).filter((p): p is Product => !!p).map((p) => ({ id: p.id, name: short(p), price: p.p, stock: START_STOCK[p.id] ?? 5, live: true }));
  }, [catalog]);
  const rows = useMemo(() => base.map((r) => ({ ...r, ...edits[r.id] })), [base, edits]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const touch = (id: number) => {
    seq.current += 1;
    setFlash({ id, n: seq.current });
    setSync((s) => s + 1);
  };
  const update = (id: number, patch: Partial<Row>) => {
    setEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } }));
    touch(id);
  };

  // real orders coming from the storefront above
  useEffect(() => {
    const on = (e: Event) => {
      const o = (e as CustomEvent<OrderEvent>).detail;
      seq.current += 1;
      const t = seq.current;
      setFeed((f) => [{ id: o.id, brand: o.brand, text: `${o.items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(", ")} · ${o.pay} · ${o.delivery}`, total: o.total, sim: false, t }, ...f].slice(0, 6));
      o.items.forEach((i) => {
        if (!IDS.includes(i.id)) return;
        setEdits((e) => ({ ...e, [i.id]: { ...e[i.id], stock: Math.max(0, (e[i.id]?.stock ?? START_STOCK[i.id] ?? 5) - i.qty) } }));
        touch(i.id);
      });
    };
    window.addEventListener("order:new", on);
    return () => window.removeEventListener("order:new", on);
  }, []);

  const simulate = () => {
    const avail = rows.filter((r) => r.live && r.stock > 0);
    if (!avail.length) return;
    seq.current += 1;
    const k = seq.current;
    const r = avail[(k * 7) % avail.length];
    const from: BrandKey = k % 2 ? concept : "agro";
    const pay = ["ბარათით", "განვადება · თიბისი", "განვადება · საქართველოს ბანკი", "განვადება · კრედო ბანკი"][k % 4];
    setFeed((f) => [{ id: nextOrderNo(from === "agro" ? "AT" : brandByKey(from).latin.slice(0, 2)), brand: from, text: `${r.name} · ${pay}`, total: r.price, sim: true, t: k }, ...f].slice(0, 6));
    update(r.id, { stock: r.stock - 1 });
  };

  return (
    <section className="engine-section" id="engine" ref={ref}>
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <span className="kicker">04 / ერთი ძრავი — ცოცხლად</span>
          <h2 className="display">ფასს ცვლით ერთხელ.<br /><em>ორივე მაღაზიაში.</em></h2>
          <p className="lead">შეცვალეთ ფასი, ნაშთი ან გამოქვეყნება მარცხენა პანელში — და უყურეთ, როგორ იცვლება ორივე ვიტრინა ერთდროულად. ერთი ბაზა, ერთი საწყობი, ერთი შეკვეთების სია. ზემოთ მაღაზიაში გაფორმებული შეკვეთაც აქ ჩნდება.</p>
        </div>

        <div className="engine" data-reveal>
          <div className="admin">
            <div className="admin-top">
              <span className="admin-title"><i /> ადმინისტრირება</span>
              <span className={`sync ${sync ? "pulse" : ""}`} key={sync}><i /> საწყობი ↔ 2 ვიტრინა · სინქრონიზებულია</span>
            </div>
            <div className="admin-table" role="table" aria-label="პროდუქტები">
              <div className="at-head" role="row"><span>პროდუქტი</span><span>ფასი</span><span>ნაშთი</span><span>ონლაინ</span></div>
              {!rows.length && <div className="at-row skeleton" />}
              {rows.map((r) => (
                <div className="at-row" role="row" key={r.id}>
                  <span className="at-name">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgS(r.id)} alt="" />
                    {r.name}
                  </span>
                  <span className="at-ctl">
                    <button onClick={() => update(r.id, { price: Math.max(50, r.price - 50) })} aria-label="ფასის შემცირება">−</button>
                    <input type="number" value={r.price} step={50} min={0} onChange={(e) => update(r.id, { price: Math.max(0, Number(e.target.value) || 0) })} aria-label={`ფასი: ${r.name}`} />
                    <button onClick={() => update(r.id, { price: r.price + 50 })} aria-label="ფასის გაზრდა">+</button>
                  </span>
                  <span className="at-ctl small">
                    <button onClick={() => update(r.id, { stock: Math.max(0, r.stock - 1) })} aria-label="ნაშთის შემცირება">−</button>
                    <b>{r.stock}</b>
                    <button onClick={() => update(r.id, { stock: r.stock + 1 })} aria-label="ნაშთის გაზრდა">+</button>
                  </span>
                  <span><button className={`toggle ${r.live ? "on" : ""}`} onClick={() => update(r.id, { live: !r.live })} aria-pressed={r.live} aria-label="გამოქვეყნება"><i /></button></span>
                </div>
              ))}
            </div>
            <div className="orders">
              <div className="orders-head">
                <span>შეკვეთები · ორივე ვიტრინიდან</span>
                <button onClick={simulate}>+ სიმულაცია</button>
              </div>
              {!feed.length && <p className="orders-empty">ჯერ შეკვეთა არ არის. გააფორმეთ შეკვეთა ზემოთ მაღაზიაში ან დააჭირეთ „სიმულაციას“.</p>}
              <ul>
                {feed.map((f) => (
                  <li key={f.id + f.t}>
                    <span className={`src src-${f.brand}`}>{f.brand === "agro" ? "AGRO TRADE" : brandByKey(f.brand).latin}</span>
                    <span className="otext">№{f.id} · {f.text}</span>
                    <b>{gel(f.total)}</b>
                    {f.sim && <em>სიმ.</em>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="phones">
            <Phone brand={concept} rows={rows} flash={flash} />
            <Phone brand="agro" rows={rows} flash={flash} />
          </div>
        </div>
      </div>
    </section>
  );
}

function short(p: Product) {
  return p.n.split("–")[0].split("(")[0].split(",")[0].trim();
}

function Phone({ brand, rows, flash }: { brand: BrandKey; rows: Row[]; flash: { id: number; n: number } | null }) {
  const b = brandByKey(brand);
  const live = useMemo(() => rows.filter((r) => r.live), [rows]);
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className={`phone-screen store store-${b.key}`} style={b.vars as CSSProperties}>
        <div className="ph-top"><BrandMark brand={b.key} size={18} /><span>{b.latin}</span></div>
        <div className="ph-url">{b.domain}</div>
        <div className="ph-list">
          {live.map((r) => (
            <div key={flash?.id === r.id ? `${r.id}-${flash.n}` : r.id} className={`ph-item ${flash?.id === r.id ? "flash" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgS(r.id)} alt="" />
              <div>
                <span>{r.name}</span>
                <b key={r.price}>{gel(r.price)}</b>
                <small className={r.stock ? "" : "out"}>{r.stock ? `მარაგშია · ${r.stock} ც.` : "ამოიწურა"}</small>
              </div>
            </div>
          ))}
          {!live.length && <p className="ph-empty">არაფერია გამოქვეყნებული</p>}
        </div>
      </div>
      <span className="phone-cap">{b.concept ? "ახალი ბრენდი" : "არსებული დომენი"}</span>
    </div>
  );
}
