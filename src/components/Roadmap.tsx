"use client";

import { useSyncExternalStore } from "react";

const TARGET = new Date(2027, 1, 1); // 1 February 2027

// A minute-resolution clock shared via useSyncExternalStore (no setState-in-effect, no hydration mismatch).
let clockNow = 0;
const clockSubs = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | undefined;
function subscribe(cb: () => void) {
  clockSubs.add(cb);
  if (!clockTimer) clockTimer = setInterval(() => { clockNow = Date.now(); clockSubs.forEach((f) => f()); }, 60_000);
  return () => {
    clockSubs.delete(cb);
    if (!clockSubs.size && clockTimer) { clearInterval(clockTimer); clockTimer = undefined; }
  };
}
const getSnapshot = () => (clockNow ||= Date.now());
const getServerSnapshot = () => 0;
const PHASES = [
  { n: "01", t: "ტექნიკური საფუძველი", d: "ტექნიკური დაზუსტება, არქიტექტურა და დიზაინის მიმართულება — 3 კვირა.", from: 0, to: 3 },
  { n: "02", t: "ახალი ბრენდი და პლატფორმა", d: "იდენტობა, კატალოგი, შეკვეთის გზა და პირველი სამუშაო ვერსია.", from: 3, to: 9 },
  { n: "03", t: "მეორე ვიტრინა და კავშირები", d: "აგრო თრეიდის ვიტრინა, გადახდა, განვადება და საწყობის ინტეგრაცია.", from: 8, to: 12 },
  { n: "04", t: "გაშვება და გამართვა", d: "ორივე პლატფორმის ტესტირება, ოპტიმიზაცია და საჯარო გაშვება.", from: 11.5, to: 14 },
];

export default function Roadmap() {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const days = now ? Math.max(0, Math.ceil((TARGET.getTime() - now) / 86_400_000)) : null;
  const weeks = days != null ? Math.floor(days / 7) : null;
  const reserve = weeks != null ? weeks - 14 : null;
  const span = Math.max(weeks ?? 18, 14);
  const pct = (w: number) => `${(w / span) * 100}%`;

  return (
    <section className="road-section" id="timeline">
      <div className="wrap">
        <div className="road-top" data-reveal>
          <div>
            <span className="kicker">06 / გზა გაშვებამდე</span>
            <h2 className="display">იდეიდან<br /><em>სეზონამდე.</em></h2>
            <p className="lead">საერთო ვადა 12–14 კვირაა. სამიზნე — 2027 წლის თებერვალი: ორივე პლატფორმა გაშვებული, დატესტილი და სეზონური მოთხოვნისთვის მზად.</p>
          </div>
          <div className="countdown" aria-live="polite">
            <span className="cd-cap">თებერვლამდე დარჩა</span>
            <strong suppressHydrationWarning>{days ?? "—"}</strong>
            <span className="cd-unit">დღე</span>
            {reserve != null && (
              <p className={reserve <= 2 ? "tight" : ""}>
                {reserve > 0 ? <>დღეს რომ დავიწყოთ, რეზერვი — <b>{reserve} კვირა</b>. ყოველი დღე ამ რეზერვს ამცირებს.</> : <>ვადა უკვე მჭიდროა — დაწყება დაუყოვნებლივ.</>}
              </p>
            )}
          </div>
        </div>

        <div className="track" data-reveal>
          <div className="track-axis">
            <span style={{ left: 0 }}>დღეს</span>
            <span style={{ left: pct(14) }} className="t14">14 კვირა</span>
            <span style={{ left: "100%" }} className="tfeb">თებ. 2027</span>
          </div>
          <div className="track-lanes">
            {PHASES.map((p) => (
              <div key={p.n} className="lane">
                <div className="bar" style={{ left: pct(p.from), width: `calc(${pct(p.to - p.from)} - 4px)` }}>
                  <span>{p.n}</span>
                </div>
              </div>
            ))}
            <div className="reserve" style={{ left: pct(14), width: `calc(100% - ${pct(14)})` }}><span>რეზერვი</span></div>
          </div>
        </div>

        <div className="phases" data-reveal>
          {PHASES.map((p) => (
            <div key={p.n}>
              <span>{p.n}</span>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
        <p className="fine" data-reveal>ვადები ეფუძნება საჭირო ინფორმაციის, წვდომებისა და გადაწყვეტილებების შეთანხმებულ დროში მიღებას. ბანკებისა და სხვა მესამე მხარეების პროცედურებმა კალენდარზე შეიძლება დამოუკიდებლად იმოქმედოს.</p>
      </div>
    </section>
  );
}
