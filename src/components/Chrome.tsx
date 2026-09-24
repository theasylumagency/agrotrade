"use client";

import { useEffect, useRef, useState } from "react";

/** Adds `.in` to every [data-reveal] element as it enters the viewport. */
export function RevealRoot() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    document.documentElement.classList.add("js");
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}

const NAV = [
  ["catalog", "კატალოგი"],
  ["store", "ვიტრინა"],
  ["engine", "ძრავი"],
  ["valiko", "ვალიკო"],
  ["timeline", "ვადები"],
  ["investment", "ინვესტიცია"],
  ["ownership", "საკუთრება"],
] as const;

export function Header() {
  const [p, setP] = useState(0);
  const [active, setActive] = useState("");
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
      setSolid(window.scrollY > window.innerHeight * 0.6);
      let cur = "";
      for (const [id] of NAV) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = id;
      }
      setActive(cur);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  return (
    <header className={`topbar ${solid ? "solid" : ""}`}>
      <a href="#top" className="tb-brand" aria-label="დასაწყისი">
        <span className="tb-mark" aria-hidden="true" />
        <span>ASILUMI <i>×</i> აგრო თრეიდი</span>
      </a>
      <nav aria-label="სექციები">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={active === id ? "on" : ""}>{label}</a>
        ))}
      </nav>
      <a className="tb-cta" href="#investment">შეთავაზება</a>
      <span className="tb-progress" style={{ transform: `scaleX(${p})` }} />
    </header>
  );
}

/** Animated number that counts up once it scrolls into view. */
export function CountUp({ to, duration = 1600, format = true }: { to: number; duration?: number; format?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = requestAnimationFrame(() => setV(0));
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        setV(Math.round(to * (1 - Math.pow(1 - k, 4))));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);
  return <span ref={ref}>{format ? v.toLocaleString("en-US") : v}</span>;
}
