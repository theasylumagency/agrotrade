"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { BRANDS, brandByKey, type BrandKey } from "@/lib/brands";
import { BANKS, STORES, gel, gelExact, imgM, imgS, monthly, type CatKey, type Product } from "@/lib/catalog";
import { BrandMark } from "./BrandMark";
import { emit, nextOrderNo, useCatalog, useProposal } from "./ProposalContext";

type Cart = { id: number; qty: number }[];
type Sort = "rec" | "asc" | "desc";
const HP = [
  { k: "7", label: "7 ცხ.ძ.-მდე", test: (h: number) => h < 8 },
  { k: "9", label: "9–10 ცხ.ძ.", test: (h: number) => h >= 8 && h < 11 },
  { k: "15", label: "13–15 ცხ.ძ.", test: (h: number) => h >= 11 },
];
const PAGE = 12;

// A curated "recommended" order: flagship machinery first.
const CAT_WEIGHT: Record<CatKey, number> = { moto: 0, atv: 1, mill: 2, mow: 3, spray: 4, milk: 5, power: 6, saw: 7, drill: 8, attach: 9, tire: 10, tools: 11 };

export default function Storefront() {
  const { brand, setBrand } = useProposal();
  const secRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const catalog = useCatalog(near);
  const [shown, setShown] = useState<BrandKey>(brand);
  const [wipe, setWipe] = useState<BrandKey | null>(null);
  const [cat, setCat] = useState<CatKey | "all">("moto");
  const [q, setQ] = useState("");
  const [hp, setHp] = useState<string | null>(null);
  const [fuel, setFuel] = useState<string | null>(null);
  const [axle, setAxle] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("rec");
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<Product | null>(null);
  const [cart, setCart] = useState<Cart>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const gridTop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "120% 0px" });
    if (secRef.current) io.observe(secRef.current);
    return () => io.disconnect();
  }, []);

  // brand switching with a wipe transition
  const shownRef = useRef(brand);
  useEffect(() => {
    if (brand === shownRef.current) return;
    shownRef.current = brand;
    setWipe(brand);
    const a = setTimeout(() => setShown(brand), 330);
    const b = setTimeout(() => setWipe(null), 760);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      setShown(brand);
      setWipe(null);
    };
  }, [brand]);

  const b = brandByKey(shown);
  const byId = useMemo(() => new Map((catalog?.items ?? []).map((p) => [p.id, p])), [catalog]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    catalog?.items.forEach((p) => m.set(p.c, (m.get(p.c) ?? 0) + 1));
    return m;
  }, [catalog]);

  const results = useMemo(() => {
    if (!catalog) return [];
    const needle = q.trim().toLowerCase();
    let list = catalog.items.filter((p) => (needle ? true : cat === "all" || p.c === cat));
    if (needle) list = list.filter((p) => (p.n + " " + (p.b ?? "") + " " + p.s.map((s) => s[1]).join(" ")).toLowerCase().includes(needle));
    if (hp) list = list.filter((p) => p.hp != null && HP.find((h) => h.k === hp)!.test(p.hp));
    if (fuel) list = list.filter((p) => p.f === fuel);
    if (axle) list = list.filter((p) => p.ax === axle);
    list = [...list];
    if (sort === "asc") list.sort((a, b) => a.p - b.p);
    else if (sort === "desc") list.sort((a, b) => b.p - a.p);
    else list.sort((a, b) => CAT_WEIGHT[a.c] - CAT_WEIGHT[b.c] || Number(b.im) - Number(a.im) || Number(b.st) - Number(a.st) || b.p - a.p);
    return list;
  }, [catalog, cat, q, hp, fuel, axle, sort]);

  const showFacets = cat === "moto" || cat === "all" || !!q;
  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const add = (p: Product) => {
    setCart((c) => (c.some((x) => x.id === p.id) ? c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x)) : [...c, { id: p.id, qty: 1 }]));
    setBump((n) => n + 1);
  };
  const pickCat = (c: CatKey | "all") => {
    setCat(c);
    setQ("");
    setLimit(PAGE);
    if (c !== "moto" && c !== "all") {
      setHp(null);
      setFuel(null);
      setAxle(null);
    }
  };
  const hero = byId.get(b.heroProduct);

  return (
    <section className="store-section" id="store" ref={secRef}>
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <span className="kicker">03 / ვიტრინა — მოქმედი პროტოტიპი</span>
          <h2 className="display">ერთი ძრავი.<br /><em>ოთხი სახე.</em></h2>
          <p className="lead">
            ქვემოთ არ არის სურათი. ეს მომუშავე მაღაზიაა აგრო თრეიდის 217 რეალური პროდუქტით: მოძებნეთ, გაფილტრეთ, გახსენით, დაამატეთ კალათაში, გამოთვალეთ განვადება. შემდეგ შეცვალეთ ბრენდი — მაღაზია იცვლება, სისტემა რჩება იგივე.
          </p>
        </div>

        <div className="brand-switch" role="tablist" aria-label="ბრენდის არჩევა" data-reveal>
          <div className="bs-group">
            <span className="bs-cap">ახალი ბრენდი · სამუშაო სახელები</span>
            <div className="bs-row">
              {BRANDS.filter((x) => x.concept).map((x) => (
                <button key={x.key} role="tab" aria-selected={brand === x.key} className={`bs-btn bs-${x.key}`} onClick={() => setBrand(x.key)}>
                  <span className="bs-mark"><BrandMark brand={x.key} size={22} /></span>
                  <span className="bs-name">{x.latin}</span>
                  <span className="bs-ka">{x.ka}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="bs-group">
            <span className="bs-cap">არსებული დომენი</span>
            <div className="bs-row">
              <button role="tab" aria-selected={brand === "agro"} className="bs-btn bs-agro" onClick={() => setBrand("agro")}>
                <span className="bs-mark"><BrandMark brand="agro" size={22} /></span>
                <span className="bs-name">AGRO TRADE</span>
                <span className="bs-ka">აგრო თრეიდი</span>
              </button>
            </div>
          </div>
        </div>
        <p className="bs-meaning" aria-live="polite"><b>{b.ka}</b> — {b.meaning} <span>{b.personality}</span></p>

        <div className="browser" data-reveal>
          <div className="browser-bar">
            <i /><i /><i />
            <div className="url"><span className="lock">●</span> https://{b.domain}{b.concept && <em>კონცეფცია</em>}</div>
            <span className="browser-note">ერთი ძრავი · {shown === "agro" ? "ვიტრინა 02" : "ვიტრინა 01"}</span>
          </div>
          <div className={`store store-${b.key}`} style={b.vars as CSSProperties}>
            {wipe && <div className="store-wipe" style={{ background: brandByKey(wipe).vars["--s-hero"] }} />}
            <header className="st-top">
              <div className="st-logo">
                <BrandMark brand={b.key} size={26} />
                <span>{b.latin}</span>
              </div>
              <label className="st-search">
                <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6" /><path d="m13.5 13.5 4 4" /></svg>
                <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="მოძებნე: ჰირომიკი, დიზელი, 9 ცხ.ძ., სათიბი…" aria-label="ძიება" />
              </label>
              <button className="st-cart" onClick={() => setCartOpen(true)} aria-label="კალათა">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11h11l2-8H7" /><circle cx="9.5" cy="19.5" r="1.5" /><circle cx="17.5" cy="19.5" r="1.5" /></svg>
                <span key={bump} className={cartCount ? "on" : ""}>{cartCount}</span>
              </button>
            </header>

            <div className="st-hero">
              <div className="st-hero-copy">
                <span className="st-tag">{b.tagline}</span>
                <h3>{b.heroTitle.split("\n").map((l, i) => <span key={i}>{l}</span>)}</h3>
                <p>{b.heroSub}</p>
                <button className="st-btn" onClick={() => { pickCat("moto"); gridTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{b.cta} →</button>
              </div>
              <button className="st-hero-product" onClick={() => hero && setOpen(hero)} disabled={!hero}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgM(b.heroProduct)} alt={hero?.n ?? ""} />
                {hero && (
                  <span className="st-hero-price">
                    <small>{hero.n.split("–")[0].split("(")[0].trim()}</small>
                    <b>{gel(hero.p)}</b>
                    <em>ან {gel(monthly(hero.p, 24))}/თვე-დან</em>
                  </span>
                )}
              </button>
            </div>

            <ul className="st-trust">
              <li><b>განვადება</b> საქართველოს ბანკი · თიბისი · კრედო</li>
              <li><b>3 მაღაზია</b> თბილისი · ოკამი · ზესტაფონი</li>
              <li><b>ონლაინ შეკვეთა</b> 24/7, ბარათით ან განვადებით</li>
            </ul>

            <div className="st-cats" ref={gridTop}>
              <button className={cat === "all" && !q ? "on" : ""} onClick={() => pickCat("all")}>ყველა <i>{catalog?.items.length ?? "…"}</i></button>
              {(catalog?.cats ?? []).map(([k, name]) => (
                <button key={k} className={cat === k && !q ? "on" : ""} onClick={() => pickCat(k)}>{name} <i>{counts.get(k) ?? 0}</i></button>
              ))}
            </div>

            {showFacets && (
              <div className="st-facets">
                <div className="fg"><span>სიმძლავრე</span>{HP.map((h) => <button key={h.k} className={hp === h.k ? "on" : ""} onClick={() => { setHp(hp === h.k ? null : h.k); setLimit(PAGE); }}>{h.label}</button>)}</div>
                <div className="fg"><span>საწვავი</span>{["ბენზინი", "დიზელი"].map((f) => <button key={f} className={fuel === f ? "on" : ""} onClick={() => { setFuel(fuel === f ? null : f); setLimit(PAGE); }}>{f}</button>)}</div>
                <div className="fg"><span>ღერძი</span>{["წვრილღერძიანი", "მსხვილღერძიანი"].map((f) => <button key={f} className={axle === f ? "on" : ""} onClick={() => { setAxle(axle === f ? null : f); setLimit(PAGE); }}>{f.replace("ღერძიანი", "")}</button>)}</div>
              </div>
            )}

            <div className="st-bar">
              <span>{catalog ? `${results.length} პროდუქტი` : "იტვირთება…"}{q && <> · „{q}“</>}</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="დალაგება">
                <option value="rec">რეკომენდებული</option>
                <option value="asc">ფასი: ზრდადობით</option>
                <option value="desc">ფასი: კლებადობით</option>
              </select>
            </div>

            <div className="st-grid">
              {!catalog && Array.from({ length: 8 }).map((_, i) => <div key={i} className="st-card skeleton" />)}
              {results.slice(0, limit).map((p) => (
                <article key={p.id} className="st-card">
                  <button className="st-card-main" onClick={() => setOpen(p)}>
                    <span className="st-well">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.im ? <img src={imgS(p.id)} srcSet={`${imgS(p.id)} 220w, ${imgM(p.id)} 760w`} sizes="(max-width: 700px) 45vw, 220px" alt="" loading="lazy" /> : <span className="noimg">ფოტო მზადდება</span>}
                      {!p.st && <em className="oos">მარაგი ივსება</em>}
                    </span>
                    <span className="st-brand">{p.b ?? " "}</span>
                    <span className="st-name">{p.n}</span>
                    <span className="st-meta">{[p.hp ? `${p.hp} ცხ.ძ.` : null, p.f, p.ax?.replace("ღერძიანი", "")].filter(Boolean).join(" · ") || " "}</span>
                    <span className="st-price">
                      <b>{p.p > 0 ? gelExact(p.p) : "ფასი დაზუსტდება"}</b>
                      {p.p >= 300 && <small>ან {gel(monthly(p.p, 12))}/თვე</small>}
                    </span>
                  </button>
                  <button className="st-add" onClick={() => add(p)} disabled={!p.st || p.p <= 0} aria-label={`კალათაში: ${p.n}`}>+</button>
                </article>
              ))}
            </div>
            {results.length > limit && <button className="st-more" onClick={() => setLimit((l) => l + PAGE)}>მეტის ჩვენება ({results.length - limit})</button>}
            {catalog && !results.length && <p className="st-empty">ვერაფერი მოიძებნა. <button onClick={() => emit.ask(q ? `ვეძებ: ${q}` : "რა ტექნიკა მჭირდება?")}>ჰკითხეთ ვალიკოს →</button></p>}

            <footer className="st-foot">
              <div className="st-logo small"><BrandMark brand={b.key} size={20} /><span>{b.latin}</span></div>
              <ul>{STORES.map((s) => <li key={s.city}><b>{s.city}</b> {s.addr}</li>)}</ul>
              <span>ვალიკო AI · ონლაინ</span>
            </footer>

            <button className="st-valiko" onClick={() => emit.ask(open ? `${open.n} — ღირს?` : "რა ტექნიკა მჭირდება ჩემი ნაკვეთისთვის?")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/valiko-concept.webp" alt="" />
              <span>ჰკითხე ვალიკოს</span>
            </button>

            {open && <ProductModal p={open} onClose={() => setOpen(null)} onAdd={() => { add(open); setOpen(null); setCartOpen(true); }} />}
            {cartOpen && <CartDrawer brand={shown} cart={cart} byId={byId} setCart={setCart} onClose={() => setCartOpen(false)} />}
          </div>
        </div>
        <p className="store-note" data-reveal>
          პროდუქტები, ფასები და ფოტოები — agro-trade.ge-ის საჯარო კატალოგიდან (24.09.2026). სახელები GUTANI, KVALI და MITSA სამუშაო კონცეფციებია; საბოლოო სახელი, დომენი და ნიშნის რეგისტრაციის შემოწმება ბრენდინგის ეტაპზე.
        </p>
      </div>
    </section>
  );
}

function ProductModal({ p, onClose, onAdd }: { p: Product; onClose: () => void; onAdd: () => void }) {
  const [bank, setBank] = useState<string>(BANKS[0]);
  const [term, setTerm] = useState(12);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="st-modal" role="dialog" aria-modal="true" aria-label={p.n} onClick={onClose}>
      <div className="st-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="st-x" onClick={onClose} aria-label="დახურვა">×</button>
        <div className="stm-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.im ? <img src={imgM(p.id)} alt={p.n} /> : <span className="noimg">ფოტო მზადდება</span>}
        </div>
        <div className="stm-body">
          <span className="st-brand">{p.b ?? ""}</span>
          <h4>{p.n}</h4>
          <div className="stm-price">{p.p > 0 ? gelExact(p.p) : "ფასი დაზუსტდება"} {!p.st && <em>მარაგი ივსება</em>}</div>
          {p.p >= 300 && (
            <div className="stm-loan">
              <span className="stm-cap">განვადების კალკულატორი</span>
              <div className="stm-row">{BANKS.map((x) => <button key={x} className={bank === x ? "on" : ""} onClick={() => setBank(x)}>{x}</button>)}</div>
              <div className="stm-row">{[6, 12, 18, 24].map((m) => <button key={m} className={term === m ? "on" : ""} onClick={() => setTerm(m)}>{m} თვე</button>)}</div>
              <div className="stm-monthly"><b>{gel(monthly(p.p, term))}</b><span>/ თვე · {bank}</span></div>
              <small>საორიენტაციო გამოთვლა პროცენტის გარეშე. ზუსტ პირობებს ბანკი ადგენს — ინტეგრაციის შემდეგ აქ ჩანს რეალური შეთავაზება.</small>
            </div>
          )}
          {p.s.length > 0 && (
            <dl className="stm-specs">
              {p.s.slice(0, 10).map(([k, v]) => <div key={k + v}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          )}
          {p.d && <p className="stm-desc">{p.d.length > 320 ? p.d.slice(0, 320).replace(/\s\S*$/, "") + "…" : p.d}</p>}
          <div className="stm-actions">
            <button className="st-btn" onClick={onAdd} disabled={!p.st || p.p <= 0}>კალათაში დამატება</button>
            <button className="st-btn ghost" onClick={() => { emit.ask(`${p.n} — რას მეტყვი ამაზე? ჩემთვის სწორი არჩევანია?`); onClose(); }}>ვკითხო ვალიკოს</button>
          </div>
          <a className="stm-src" href={p.u} target="_blank" rel="noreferrer">იგივე პროდუქტი agro-trade.ge-ზე ↗</a>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ brand, cart, byId, setCart, onClose }: { brand: BrandKey; cart: Cart; byId: Map<number, Product>; setCart: (f: (c: Cart) => Cart) => void; onClose: () => void }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [pay, setPay] = useState("ბარათით");
  const [bank, setBank] = useState<string>(BANKS[0]);
  const [delivery, setDelivery] = useState("მიტანა");
  const [store, setStore] = useState<string>(STORES[0].city);
  const [orderNo, setOrderNo] = useState("");
  const lines = cart.map((c) => ({ ...c, p: byId.get(c.id)! })).filter((l) => l.p);
  const total = lines.reduce((a, l) => a + l.p.p * l.qty, 0);
  const qty = (id: number, d: number) => setCart((c) => c.map((x) => (x.id === id ? { ...x, qty: Math.max(0, x.qty + d) } : x)).filter((x) => x.qty > 0));
  const confirm = () => {
    const no = nextOrderNo(brand === "agro" ? "AT" : brandByKey(brand).latin.slice(0, 2));
    setOrderNo(no);
    setStep(2);
    emit.order({ id: no, brand, items: lines.map((l) => ({ id: l.id, name: l.p.n, qty: l.qty, price: l.p.p })), total, pay: pay === "განვადებით" ? `განვადება · ${bank}` : pay, delivery: delivery === "მიტანა" ? "მიტანა" : `თვითგატანა · ${store}` });
    setCart(() => []);
  };
  return (
    <div className="st-drawer-bg" onClick={onClose}>
      <aside className="st-drawer" onClick={(e) => e.stopPropagation()} aria-label="კალათა">
        <header><b>{step === 2 ? "შეკვეთა მიღებულია" : step === 1 ? "გაფორმება" : "კალათა"}</b><button className="st-x" onClick={onClose} aria-label="დახურვა">×</button></header>
        {step === 0 && (
          <>
            {!lines.length && <p className="st-empty">კალათა ცარიელია. დაამატეთ პროდუქტი „+“ ღილაკით.</p>}
            <ul className="cart-lines">
              {lines.map((l) => (
                <li key={l.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgS(l.id)} alt="" />
                  <div><span>{l.p.n}</span><b>{gelExact(l.p.p * l.qty)}</b></div>
                  <div className="qty"><button onClick={() => qty(l.id, -1)}>−</button><span>{l.qty}</span><button onClick={() => qty(l.id, 1)}>+</button></div>
                </li>
              ))}
            </ul>
            {!!lines.length && (
              <div className="cart-foot">
                <div className="cart-total"><span>სულ</span><b>{gelExact(total)}</b></div>
                {total >= 300 && <small>ან განვადებით ~{gel(monthly(total, 24))}/თვე-დან</small>}
                <button className="st-btn" onClick={() => setStep(1)}>გაფორმება →</button>
              </div>
            )}
          </>
        )}
        {step === 1 && (
          <div className="checkout">
            <span className="stm-cap">გადახდა</span>
            <div className="stm-row">{["ბარათით", "განვადებით", "მაღაზიაში"].map((x) => <button key={x} className={pay === x ? "on" : ""} onClick={() => setPay(x)}>{x}</button>)}</div>
            {pay === "განვადებით" && <div className="stm-row">{BANKS.map((x) => <button key={x} className={bank === x ? "on" : ""} onClick={() => setBank(x)}>{x}</button>)}</div>}
            <span className="stm-cap">მიღება</span>
            <div className="stm-row">{["მიტანა", "თვითგატანა"].map((x) => <button key={x} className={delivery === x ? "on" : ""} onClick={() => setDelivery(x)}>{x}</button>)}</div>
            {delivery === "თვითგატანა" && <div className="stm-row">{STORES.map((s) => <button key={s.city} className={store === s.city ? "on" : ""} onClick={() => setStore(s.city)}>{s.city}</button>)}</div>}
            <div className="demo-fields">
              <input placeholder="სახელი" aria-label="სახელი" />
              <input placeholder="ტელეფონი" aria-label="ტელეფონი" inputMode="tel" />
            </div>
            <small className="demo-note">დემო: მონაცემები არსად იგზავნება.</small>
            <div className="cart-total"><span>სულ</span><b>{gelExact(total)}</b></div>
            <button className="st-btn" onClick={confirm}>შეკვეთის დადასტურება</button>
          </div>
        )}
        {step === 2 && (
          <div className="done">
            <div className="done-check">✓</div>
            <b>შეკვეთა №{orderNo}</b>
            <p>ასე მიიღებს მომხმარებელი დადასტურებას. იმავე წამს შეკვეთა ჩნდება ერთიან ადმინისტრირებაში — საწყობის ნაშთი მცირდება ორივე ვიტრინაზე.</p>
            <a className="st-btn" href="#engine" onClick={onClose}>ნახეთ ადმინისტრირებაში ↓</a>
          </div>
        )}
      </aside>
    </div>
  );
}
