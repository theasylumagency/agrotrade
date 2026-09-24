import HeroField from "@/components/HeroField";
import CatalogAssembly from "@/components/CatalogAssembly";
import Storefront from "@/components/Storefront";
import EngineDemo from "@/components/EngineDemo";
import Valiko from "@/components/Valiko";
import Roadmap from "@/components/Roadmap";
import { ProposalProvider } from "@/components/ProposalContext";
import { CountUp, Header, RevealRoot } from "@/components/Chrome";

const LINES = [
  { label: "ტექნიკური დაზუსტება და არქიტექტურა", detail: "3 კვირა", amount: 4000 },
  { label: "ახალი სავაჭრო პლატფორმა და ახალი ბრენდის ვიტრინა", detail: "საერთო ტექნოლოგიური ბირთვი", amount: 25000 },
  { label: "მეორე ვიტრინა აგრო თრეიდის არსებულ დომენზე", detail: "იგივე ძრავი, საკუთარი დიზაინი", amount: 8000 },
  { label: "ახალი ბრენდის შექმნა", detail: "სახელი, იდენტობა, გამოყენების ძირითადი წესები", amount: 4000 },
  { label: "შეთანხმებული ინტეგრაციები", detail: "გადახდა, 2–3 ბანკის განვადება, საწყობი", amount: 8000 },
];
const TOTAL = LINES.reduce((a, l) => a + l.amount, 0);
const PAY = [
  { when: "დაწყებამდე", what: "ტექნიკური ეტაპის დაწყებამდე", amount: 4000, share: "ავანსი" },
  { when: "ეტაპი 1", what: "ტექნიკური დავალებისა და დიზაინის მიმართულების დამტკიცების შემდეგ", amount: 13500, share: "დარჩენილის 30%" },
  { when: "ეტაპი 2", what: "პირველი პლატფორმის სამუშაო ვერსიის მზადყოფნისას", amount: 18000, share: "დარჩენილის 40%" },
  { when: "ეტაპი 3", what: "ორივე პლატფორმის საჯაროდ გაშვებამდე", amount: 13500, share: "დარჩენილის 30%" },
];
const OWN = [
  { t: "პლატფორმის საწყისი კოდი", d: "საერთო ტექნოლოგიური ბირთვი, ორივე ვიტრინა, ადმინისტრირება და ინტეგრაციები — Git რეპოზიტორია სრული ისტორიით." },
  { t: "მონაცემები", d: "პროდუქტის ბაზა, კატალოგის სტრუქტურა, აღწერები და პროექტში შექმნილი ყველა მონაცემი." },
  { t: "ახალი ბრენდი", d: "სახელი, ლოგო, ვიზუალური იდენტობა, გამოყენების წესები და დიზაინის წყარო-ფაილები." },
  { t: "ვალიკო AI", d: "პერსონა და ხასიათი, ვიზუალური სახე, ინსტრუქციები და ცოდნის ბაზა, საუბრის სცენარები, პროექტში შექმნილი კოდი და კონფიგურაციები." },
  { t: "ვალიკოს ციფრული აქტივები", d: "Facebook და TikTok გვერდები მთელი აუდიტორიით, ყველა ვიდეო, ტექსტი და ვიზუალი." },
  { t: "ანგარიშები და წვდომები", d: "დომენები, ჰოსტინგი, სარეკლამო და ანალიტიკის ანგარიშები — სრული ადმინისტრაციული უფლებით." },
];
const NEEDS = [
  "არსებული საიტის, დომენებისა და ადმინისტრაციული სისტემების საჭირო წვდომები.",
  "პროდუქტის ბაზა, ფასები, ტექნიკური ინფორმაცია და არსებული ფოტოები.",
  "საწყობისა და აღრიცხვის პროცესების, ასევე ბანკებთან არსებული ურთიერთობების ინფორმაცია.",
  "ერთი პასუხისმგებელი საკონტაქტო პირი ყოველდღიური კოორდინაციისთვის.",
  "ბრენდთან, პროდუქტებთან და ბიზნეს-ლოგიკასთან დაკავშირებულ კითხვებზე დროული პასუხები.",
  "გადაწყვეტილებების შეთანხმებულ ვადებში დამტკიცება და მესამე მხარეებთან საჭირო ავტორიზაციები.",
];
const TICKER = ["217 რეალური პროდუქტი", "2 ვიტრინა", "1 ძრავი", "ვალიკო AI", "12–14 კვირა", "100% თქვენი"];
const fmt = (n: number) => n.toLocaleString("en-US");

export default function Home() {
  return (
    <ProposalProvider>
      <RevealRoot />
      <Header />
      <main>
        <section className="hero" id="top">
          <HeroField />
          <div className="hero-vignette" aria-hidden="true" />
          <div className="hero-inner wrap">
            <div className="hero-kicker"><span className="line" /> კომერციული შეთავაზება · აგრო თრეიდი · სექტემბერი 2026</div>
            <h1 className="hero-title">
              <span className="w w1">ნუ</span> <span className="w w2">დაგვიჯერებთ.</span>
              <em className="w w3">შეამოწმეთ.</em>
            </h1>
            <p className="hero-sub">ეს არ არის პრეზენტაცია. ქვემოთ არის მომუშავე პროტოტიპი თქვენი 217 რეალური პროდუქტით — ახალი ვიტრინა, ერთი ძრავი ორი ბრენდისთვის და AI კონსულტანტი, რომელსაც ახლავე შეგიძლიათ ჰკითხოთ.</p>
            <div className="hero-actions">
              <a className="btn" href="#store">გახსენით მაღაზია <span>→</span></a>
              <a className="btn ghost" href="#valiko">ჰკითხეთ ვალიკოს</a>
            </div>
          </div>
          <div className="hero-foot wrap">
            <span>ASILUMI — design & disruption studio · თბილისი</span>
            <span className="scroll-cue">ჩამოსქროლეთ <i>↓</i></span>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {[0, 1, 2, 3].map((k) => TICKER.map((t) => <span key={`${k}-${t}`}>{t} <i>✳</i></span>))}
          </div>
        </div>

        <CatalogAssembly />
        <Storefront />
        <EngineDemo />
        <Valiko />
        <Roadmap />

        <section className="invest-section" id="investment">
          <div className="wrap">
            <div className="invest-top" data-reveal>
              <div>
                <span className="kicker">07 / ინვესტიცია</span>
                <h2 className="display">ერთი პროექტი.<br /><em>ერთი მკაფიო ფასი.</em></h2>
                <p className="lead">ერთჯერადი ღირებულება მოიცავს ტექნიკურ საფუძველს, ორ ვიტრინას, ახალ ბრენდს, 217 პროდუქტის მიგრაციას და შეთანხმებულ ინტეგრაციებს.</p>
              </div>
              <div className="total">
                <span>ერთჯერადი პროექტი</span>
                <strong><CountUp to={TOTAL} /> <small>₾</small></strong>
                <em>ყველა ფასი მოცემულია დღგ-ის გარეშე.</em>
              </div>
            </div>

            <div className="lines" data-reveal>
              {LINES.map((l, i) => (
                <div className="line-row" key={l.label} style={{ ["--w" as string]: `${(l.amount / TOTAL) * 100}%` }}>
                  <span className="li-n">0{i + 1}</span>
                  <div><b>{l.label}</b><small>{l.detail}</small></div>
                  <span className="li-bar" aria-hidden="true"><i /></span>
                  <b className="li-amt">{fmt(l.amount)} ₾</b>
                </div>
              ))}
              <div className="line-row total-row"><span className="li-n" /><div><b>სულ</b></div><span /><b className="li-amt">{fmt(TOTAL)} ₾</b></div>
            </div>

            <div className="pay" data-reveal>
              <div className="pay-head">
                <span className="kicker">გადახდის გრაფიკი</span>
                <h3>ეტაპებთან მიბმული ანგარიშსწორება.</h3>
              </div>
              <div className="pay-bar" aria-hidden="true">
                {PAY.map((p) => <i key={p.when} style={{ flexGrow: p.amount }} />)}
              </div>
              <div className="pay-steps">
                {PAY.map((p) => (
                  <div key={p.when}>
                    <span>{p.when} · {p.share}</span>
                    <strong>{fmt(p.amount)} ₾</strong>
                    <small>{p.what}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="monthly" data-reveal>
              <div className="mo-head">
                <span className="kicker">ვალიკო AI · ახალი ბრენდის მარკეტინგული მიმართულება</span>
                <h3><CountUp to={5500} /> ₾ <small>/ თვე · 6 თვე</small></h3>
                <p>თვიური საერთო ბიუჯეტი. პირველ სამ თვეში მეტი რესურსი მიდის არხის შექმნასა და წარმოებაზე, შემდეგ სამში — რეკლამისა და ზრდის მასშტაბირებაზე.</p>
              </div>
              <div className="mo-split">
                <div>
                  <span>1–3 თვე</span>
                  <div className="mo-bar"><i style={{ flexGrow: 4000 }}>4,000 ₾ მომსახურება</i><em style={{ flexGrow: 1500 }}>1,500 ₾ რეკლამა/ტექ.</em></div>
                </div>
                <div>
                  <span>4–6 თვე</span>
                  <div className="mo-bar"><i style={{ flexGrow: 3000 }}>3,000 ₾ მომსახურება</i><em style={{ flexGrow: 2500 }}>2,500 ₾ რეკლამა/ტექ.</em></div>
                </div>
              </div>
              <ul className="mo-inc">
                <li><b>8–12 მოკლე ვიდეო</b> თვეში, სხვადასხვა ფორმატისა და თემატიკის ტესტირებით.</li>
                <li><b>2–3 ძირითადი ლენდინგი</b> პირველ ეტაპზე, შემდეგ — ადაპტაცია კამპანიების მიხედვით.</li>
                <li><b>ორივე პლატფორმის ტექნიკური მხარდაჭერა</b> — გამართულობა, განახლებები, უსაფრთხოება, სარეზერვო ასლები, ინტეგრაციების მონიტორინგი.</li>
              </ul>
              <p className="fine">ყოველი თვის ბიუჯეტი წინასწარ შეთანხმდება. სარეკლამო და ტექნოლოგიური ხარჯები გადაიხდება უშუალოდ დამკვეთის ანგარიშებიდან. მიმართულება ემსახურება ახალ ბრენდს — აგრო თრეიდის არსებული ბრენდის სოციალური ქსელების, რეკლამისა და კონტენტის მართვა მასში არ შედის.</p>
            </div>
          </div>
        </section>

        <section className="own-section" id="ownership">
          <div className="own-glow" aria-hidden="true" />
          <div className="wrap">
            <div className="own-head" data-reveal>
              <span className="kicker">08 / საკუთრება</span>
              <h2 className="own-title">ყველაფერი, რასაც ვქმნით —<br /><em>თქვენია.</em></h2>
              <p className="lead">საბოლოო ანგარიშსწორების შემდეგ აგრო თრეიდი ხდება პროექტში შექმნილი ყველა შედეგის ერთადერთი და ექსკლუზიური მესაკუთრე. არავითარი ლიცენზიური დამოკიდებულება ჩვენზე. არავითარი „ქირით აღებული“ პლატფორმა.</p>
            </div>

            <div className="deed" data-reveal>
              <div className="deed-head">
                <div>
                  <span className="deed-cap">საკუთრების გადაცემა</span>
                  <b>ASILUMI <i>→</i> შპს „აგრო თრეიდი“</b>
                </div>
                <div className="stamp" aria-label="ექსკლუზიური საკუთრება">
                  <svg viewBox="0 0 120 120" aria-hidden="true">
                    <defs><path id="stampCircle" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" /></defs>
                    <circle cx="60" cy="60" r="57" />
                    <circle cx="60" cy="60" r="35" />
                    <text><textPath href="#stampCircle" textLength="286" lengthAdjust="spacing">ექსკლუზიური საკუთრება ✦ EXCLUSIVE ✦</textPath></text>
                  </svg>
                  <span>100%</span>
                </div>
              </div>
              <ol className="deed-list">
                {OWN.map((o, i) => (
                  <li key={o.t} style={{ ["--i" as string]: i }}>
                    <span className="chk" aria-hidden="true">✓</span>
                    <div><b>{o.t}</b><p>{o.d}</p></div>
                    <span className="owner"><s>ASILUMI</s> აგრო თრეიდი</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="terms" data-reveal>
              <div><b>ექსკლუზიურად</b><p>ASILUMI არ იტოვებს შექმნილი კოდის, ბრენდის ან ვალიკოს ხელახლა გამოყენების ან სხვისთვის გადაცემის უფლებას.</p></div>
              <div><b>როდის</b><p>გადაცემა ფორმდება ხელშეკრულებით და სრულდება საბოლოო ანგარიშსწორების შემდეგ. ვალიკოს ყოველთვიური კონტენტი თქვენი ხდება შესაბამისი თვის ანგარიშსწორებისთანავე.</p></div>
              <div><b>თავიდანვე თქვენს სახელზე</b><p>სოციალური გვერდები, სარეკლამო ანგარიშები და დომენები პირველივე დღიდან იქმნება აგრო თრეიდის სახელზე — ASILUMI მუშაობს ადმინისტრატორის უფლებით.</p></div>
            </div>
            <p className="fine" data-reveal>მესამე მხარის სერვისები — AI მოდელები, ბანკებისა და გადახდის სისტემები, ღია კოდის ბიბლიოთეკები და ჰოსტინგის პროვაიდერები — გამოიყენება მათი ლიცენზიების პირობებით და არ წარმოადგენს გადასაცემ საკუთრებას.</p>
          </div>
        </section>

        <section className="needs-section">
          <div className="wrap needs" data-reveal>
            <div>
              <span className="kicker">09 / თანამშრომლობა</span>
              <h2 className="display">სწორი შედეგი<br /><em>ერთად იქმნება.</em></h2>
            </div>
            <ol>
              {NEEDS.map((n, i) => <li key={n}><b>0{i + 1}</b><p>{n}</p></li>)}
            </ol>
          </div>
        </section>

        <section className="final">
          <div className="wrap" data-reveal>
            <span className="kicker">ASILUMI × აგრო თრეიდი</span>
            <h2>სეზონი თებერვალში იწყება.<br /><em>ჩვენ მზად ვართ დღეს.</em></h2>
            <div className="final-actions">
              <a className="btn" href="/Agro_Trade_Commercial_Proposal_v3.pdf" download>PDF ვერსია <span>↓</span></a>
              <a className="btn ghost" href="#top">თავიდან ნახვა <span>↑</span></a>
            </div>
          </div>
          <footer className="foot wrap">
            <span>ASILUMI <i>×</i> AGRO TRADE</span>
            <span>კომერციული შეთავაზება · სექტემბერი 2026 · კონფიდენციალური</span>
          </footer>
        </section>
      </main>
    </ProposalProvider>
  );
}
