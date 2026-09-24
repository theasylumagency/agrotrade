"use client";

import { useEffect, useRef, useState } from "react";
import data from "@/data/xray.json";
import { imgS } from "@/lib/catalog";

type Tile = [number, number, string[], number];
const TILES = data.xray as Tile[];
const CATS = data.cats as [string, string][];
const S = data.stats;
const SHORT: Record<string, string> = { moto: "მოტობლოკები", atv: "კვადროციკლები", mow: "სათიბები", spray: "შეწამვლა, მორწყვა", mill: "საფქვავები", milk: "საწველი აპარატები", power: "ძრავები, გენერატორები", saw: "ხერხები", drill: "მიწის ბურღები", tire: "საბურავები", attach: "მისაბმელები", tools: "ხელსაწყოები" };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// deterministic pseudo-random so server/client agree
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

type Layout = { W: number; H: number; T: number; tiles: { sx: number; sy: number; ss: number; sr: number; tx: number; ty: number; stagger: number }[]; labels: { x: number; y: number; w: number }[]; base: number };

function computeLayout(W: number, H: number): Layout {
  const mobile = W < 720;
  const cols = W > 1100 ? 6 : W > 720 ? 4 : 3;
  const rows = Math.ceil(CATS.length / cols);
  const pad = mobile ? 16 : 48;
  const y0 = H * (mobile ? 0.3 : 0.3);
  const areaW = W - pad * 2;
  const areaH = H - y0 - (mobile ? 18 : 36);
  const cellW = areaW / cols;
  const cellH = areaH / rows;
  const labelH = mobile ? 26 : 34;
  const gap = mobile ? 8 : 18;
  const counts = CATS.map((_, i) => TILES.filter((t) => t[1] === i).length);
  const max = Math.max(...counts);
  let T = 44;
  for (; T > 6; T -= 0.5) {
    const perRow = Math.floor((cellW - gap) / T);
    if (perRow < 1) continue;
    if (Math.ceil(max / perRow) * T + labelH <= cellH - gap) break;
  }
  const perRow = Math.max(1, Math.floor((cellW - gap) / T));
  const base = mobile ? 36 : 70;
  const r = rng(42);
  const seen: number[] = CATS.map(() => 0);
  const tiles = TILES.map((t) => {
    const g = t[1];
    const k = seen[g]++;
    const cx = pad + (g % cols) * cellW;
    const cy = y0 + Math.floor(g / cols) * cellH;
    const depth = mobile ? 0.45 + r() * 0.85 : 0.45 + r() * 1.25;
    return {
      sx: -0.08 * W + r() * 1.16 * W,
      sy: -0.06 * H + r() * 1.12 * H,
      ss: depth,
      sr: (r() - 0.5) * 50,
      tx: cx + (k % perRow) * T,
      ty: cy + labelH + Math.floor(k / perRow) * T,
      stagger: (g / CATS.length) * 0.55 + r() * 0.45,
    };
  });
  const labels = CATS.map((_, g) => ({ x: pad + (g % cols) * cellW, y: y0 + Math.floor(g / cols) * cellH, w: cellW - gap }));
  return { W, H, T, tiles, labels, base };
}

export default function CatalogAssembly() {
  const secRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [phase, setPhase] = useState(0);
  const [load, setLoad] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const measure = () => setLayout(computeLayout(el.clientWidth, el.clientHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: "150% 0px" });
    if (secRef.current) io.observe(secRef.current);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!layout) return;
    const sec = secRef.current!;
    const nodes = Array.from(fieldRef.current!.children) as HTMLElement[];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let lastPhase = -1;
    let lastCount = -1;
    const start = performance.now();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const rect = sec.getBoundingClientRect();
      const total = sec.offsetHeight - window.innerHeight;
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const p = clamp(-rect.top / total);
      const t = reduce ? 0 : (performance.now() - start) / 1000;
      const intro = easeInOut(clamp(p / 0.16));
      const { base, T } = layout;
      for (let i = 0; i < nodes.length; i++) {
        const d = layout.tiles[i];
        const a = easeInOut(clamp((p - 0.36 - d.stagger * 0.2) / 0.24));
        const drift = (1 - a) * (reduce ? 0 : 1);
        const fx = Math.sin(t * 0.35 + i) * 14 * drift * d.ss;
        const fy = Math.cos(t * 0.3 + i * 1.7) * 10 * drift * d.ss;
        const cx = layout.W / 2;
        const cy = layout.H / 2;
        const sx = cx + (d.sx - cx) * intro;
        const sy = cy + (d.sy - cy) * intro;
        const x = sx + (d.tx - sx) * a + fx;
        const y = sy + (d.ty - sy) * a + fy;
        const sScatter = d.ss * intro;
        const s = sScatter + ((T - 1.5) / base - sScatter) * a;
        const r = d.sr * (1 - a);
        nodes[i].style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${r.toFixed(1)}deg) scale(${s.toFixed(3)})`;
        nodes[i].style.opacity = String(Math.min(1, intro * (0.35 + 0.65 * Math.min(1, d.ss))) * (1 - a) + a);
        nodes[i].style.zIndex = String(a > 0.5 ? 1 : Math.round(d.ss * 10));
      }
      const ph = p < 0.18 ? 0 : p < 0.36 ? 1 : p < 0.76 ? 2 : p < 0.9 ? 3 : 4;
      if (ph !== lastPhase) {
        lastPhase = ph;
        setPhase(ph);
      }
      const c = Math.round(217 * clamp(p / 0.14));
      if (c !== lastCount) {
        lastCount = c;
        setCount(c);
      }
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [layout]);

  return (
    <section className={`assembly ph-${phase}`} ref={secRef} id="catalog" aria-label="კატალოგის მიგრაცია">
      <div className="assembly-stage">
        <div className="assembly-field" ref={fieldRef}>
          {TILES.map((t) => (
            <div key={t[0]} className={`tile ${t[2].some((x) => x === "dup" || x === "nodesc" || x === "test") ? "has-issue" : ""}`} style={{ width: layout?.base ?? 70, height: layout?.base ?? 70 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {t[3] && load ? <img src={imgS(t[0])} alt="" decoding="async" /> : <span />}
            </div>
          ))}
        </div>
        <div className="assembly-labels" aria-hidden={phase < 3}>
          {layout?.labels.map((l, g) => (
            <div key={CATS[g][0]} className="assembly-label" style={{ left: l.x, top: l.y, width: l.w }}>
              <b>{SHORT[CATS[g][0]] ?? CATS[g][1]}</b>
              <span>{TILES.filter((t) => t[1] === g).length}</span>
            </div>
          ))}
        </div>
        <div className="assembly-copy">
          <div className="ac ac-0">
            <span className="kicker">01 / თქვენი კატალოგი</span>
            <strong className="ac-count">{count}</strong>
            <p>პროდუქტი. აგრო თრეიდის მთელი კატალოგი — რეალური ფოტოებით, ფასებით და მახასიათებლებით.</p>
          </div>
          <div className="ac ac-1">
            <span className="kicker">01 / თქვენი კატალოგი</span>
            <h2>217-ვე უკვე<br />გადავამოწმეთ.<br /><em>სათითაოდ.</em></h2>
          </div>
          <div className="ac ac-2">
            <span className="kicker">02 / მიგრაცია</span>
            <h2>12 მკაფიო კატეგორია —<br /><em>ისე, როგორც მყიდველი ფიქრობს.</em></h2>
          </div>
          <div className="ac ac-4">
            <span className="kicker">02 / მიგრაცია</span>
            <h2>და ვასწორებთ იმას,<br /><em>რაც გაყიდვას უშლის ხელს.</em></h2>
            <ul className="facts">
              <li><b>{S.dup}</b> ბარათი {S.dupgroups} განმეორებული სახელით — გავაერთიანებთ ან გავმიჯნავთ.</li>
              <li><b>{S.nodesc}</b> პროდუქტს აღწერა საერთოდ არ აქვს — დავწერთ.</li>
              <li><b>{S.test}</b> სატესტო პროდუქტი 1 ₾-ად ჩანს კულტივატორების პირველ ადგილზე — მოვაშორებთ.</li>
              <li><b>+</b> ფილტრები სიმძლავრით, საწვავით, ღერძით, ბრენდით და ფასით.</li>
            </ul>
            <p className="facts-foot"><span className="dot" /> ეს სამუშაო ერთჯერად ფასში შედის.</p>
          </div>
        </div>
        <div className="assembly-source">წყარო: agro-trade.ge საჯარო კატალოგი · 24.09.2026</div>
      </div>
    </section>
  );
}
