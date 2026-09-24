"use client";

import { brandByKey } from "@/lib/brands";
import { imgM } from "@/lib/catalog";
import { BrandMark } from "./BrandMark";
import { useProposal } from "./ProposalContext";

const PORTRAIT = "/images/valiko-concept.webp";

const PERSONA = [
  ["ვინ არის", "გამოცდილი ფერმერი და მექანიკოსი, რომელმაც ტექნიკა ხელით იცის."],
  ["ტონი", "თბილი, პირდაპირი, ცოტა ირონიული. ლაპარაკობს ისე, როგორც სოფელში ლაპარაკობენ."],
  ["პრინციპი", "„ზედმეტს არ გაგიყიდი.“ თუ იაფი გყოფნის — ამას პირველი იტყვის."],
  ["ფორმატი", "მოკლე ვიდეო, პოსტი, პირდაპირი პასუხი კომენტარებში და ჩატში."],
] as const;

const RUBRICS = [
  ["ვალიკოს რჩევა", "30-წამიანი პრაქტიკული რჩევები: რა, როდის და როგორ."],
  ["7 თუ 9?", "გულწრფელი შედარებები და ვერდიქტი — რომელი ჯობია და რატომ."],
  ["ვალიკო ეზოში", "ტექნიკა რეალურ სამუშაოზე: ხვნა, თიბვა, შეწამვლა."],
  ["კითხვა ვალიკოს", "პასუხები კომენტარებში დასმულ კითხვებზე — ვიდეოთი."],
  ["სეზონის კალენდარი", "ამ თვეში ბაღში, ბოსტანსა და მინდორში რა უნდა გაკეთდეს."],
] as const;

export default function ValikoStory() {
  const { concept } = useProposal();
  const brand = brandByKey(concept);

  return (
    <section className="vk" id="valiko" aria-label="ვალიკო AI">
      {/* 1 — portrait */}
      <div className="vk-hero">
        <div className="vk-portrait" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PORTRAIT} alt="" />
          <div className="vk-grain" />
          <span className="vk-chip c1"><i className="fb">f</i> @valiko.ai <b>Facebook</b></span>
          <span className="vk-chip c2"><i className="tt">♪</i> @valiko.ai <b>TikTok</b></span>
          <span className="vk-chip c3"><i className="live" /> ჩატში · 24/7</span>
          <span className="vk-ai">AI</span>
        </div>
        <div className="vk-intro wrap-r" data-reveal>
          <span className="kicker">05 / ვალიკო AI — ბრენდის სახე</span>
          <h2 className="vk-title">გაიცანით<br /><em>ვალიკო.</em></h2>
          <p className="vk-tag">AI ინფლუენსერი. ბრენდის ელჩი.<br />მრჩეველი, რომელსაც ენდობიან.</p>
          <p className="lead">ვალიკო ჩატბოტი არ არის. ეს პერსონაჟია საკუთარი სახით, ხმით, ხასიათითა და აუდიტორიით — AI ინფლუენსერი საკუთარი Facebook და TikTok გვერდებით. ის ხსნის, ადარებს, ხუმრობს და ნდობას აშენებს. ახალი ბრენდი ამ ნდობას გაყიდვად აქცევს.</p>
          <dl className="vk-persona">
            {PERSONA.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <p className="vk-note">პერსონის კონცეფცია — ხასიათი, ხმა და ვიზუალი საბოლოოდ დაზუსტდება პირველ თვეში.</p>
        </div>
      </div>

      {/* 2 — ecosystem */}
      <div className="wrap vk-flow-wrap">
        <div className="sec-head" data-reveal>
          <span className="kicker">როგორ მუშაობს</span>
          <h3 className="display vk-h3">ერთი პერსონაჟი.<br /><em>სამი როლი.</em></h3>
        </div>
        <ol className="vk-flow" data-reveal>
          <li className="vk-node">
            <span className="vk-n">01</span>
            <div className="vk-ico"><i className="fb">f</i><i className="tt">♪</i></div>
            <b>ვალიკოს საკუთარი არხები</b>
            <p>საკუთარი კონტენტი — რჩევები, შედარებები, ისტორიები. აუდიტორია, რომელიც ენდობა ადამიანს და არა რეკლამას.</p>
          </li>
          <li className="vk-link" aria-hidden="true"><span>აზიარებს</span></li>
          <li className="vk-node">
            <span className="vk-n">02</span>
            <div className="vk-ico brand"><BrandMark brand={brand.key} size={20} /></div>
            <b>ახალი ბრენდის არხები</b>
            <p>ბრენდი დებს საკუთარ კონტენტს — პროდუქტს, შეთავაზებებს, სიახლეებს. ვალიკო იქ მრჩევლად ჩნდება, ბრენდი კი აზიარებს მის პოსტებს.</p>
          </li>
          <li className="vk-link" aria-hidden="true"><span>ბმული</span></li>
          <li className="vk-node">
            <span className="vk-n">03</span>
            <div className="vk-ico chat">…</div>
            <b>საიტი და ლენდინგები</b>
            <p>ჩატში ვალიკო პირადად არჩევს ტექნიკას, ითვლის განვადებას და მზა ლიდს გადასცემს გაყიდვების გუნდს.</p>
          </li>
          <li className="vk-link" aria-hidden="true"><span>ლიდი</span></li>
          <li className="vk-node vk-sales">
            <span className="vk-n">→</span>
            <div className="vk-ico sales">₾</div>
            <b>გაყიდვების გუნდი</b>
            <p>იღებს არა „ლაიქს“, არამედ ადამიანს, რომელმაც უკვე იცის, რა უნდა და როგორ გადაიხდის.</p>
          </li>
        </ol>
      </div>

      {/* 3 — content */}
      <div className="wrap vk-content">
        <div className="vk-content-head" data-reveal>
          <div>
            <span className="kicker">ვალიკოს კონტენტი · კონცეფცია</span>
            <h3 className="display vk-h3">ნდობა იწყება<br /><em>პირველი ვიდეოდან.</em></h3>
          </div>
          <ul className="vk-rubrics">
            {RUBRICS.map(([k, v]) => <li key={k}><b>{k}</b><span>{v}</span></li>)}
          </ul>
        </div>

        <div className="vk-reels" data-reveal>
          <article className="vk-reel r-face">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bg" src={PORTRAIT} alt="" loading="lazy" />
            <Top rubric="7 თუ 9?" />
            <div className="vk-reel-b"><b>7 თუ 9 ცხენის ძალა?</b><span>30 წამში აგიხსნი, რატომ არ უნდა გადაიხადო ზედმეტი.</span></div>
            <Side />
          </article>

          <article className="vk-reel r-product">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bg" src={PORTRAIT} alt="" loading="lazy" />
            <div className="vk-reel-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgM(8806)} alt="" loading="lazy" />
              <span>ჰირომიკი 195F · დიზელი</span>
            </div>
            <Top rubric="ვალიკო ეზოში" />
            <div className="vk-reel-b"><b>1 ჰექტარი, 1 ავზი.</b><span>ვცადე დიზელი — აი, რამდენი დაიხარჯა.</span></div>
            <Side />
          </article>

          <article className="vk-reel r-qa">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bg" src={PORTRAIT} alt="" loading="lazy" />
            <div className="vk-comment">
              <span className="who">კომენტარი</span>
              <p>„20 სოტკა მაქვს ფერდობზე. მინიკულტივატორი ჩაწვდება?“</p>
            </div>
            <Top rubric="კითხვა ვალიკოს" />
            <div className="vk-reel-b"><b>კი, მაგრამ ერთი პირობით.</b><span>ვალიკო პასუხობს — ვიდეოთი, 40 წამში.</span></div>
            <Side />
          </article>

          <article className="vk-share">
            <header>
              <span className="av brand"><BrandMark brand={brand.key} size={18} /></span>
              <div><b>{brand.latin}</b><small>გააზიარა ვალიკოს ვიდეო</small></div>
            </header>
            <p>ვალიკომ ახსნა უკეთ, ვიდრე ჩვენ ავხსნიდით. თქვენი ნაკვეთისთვის რომელი გჭირდებათ — ჰკითხეთ ჩატში.</p>
            <div className="vk-share-inner">
              <header>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="av" src={PORTRAIT} alt="" />
                <div><b>ვალიკო <i>AI</i></b><small>@valiko.ai</small></div>
              </header>
              <div className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PORTRAIT} alt="" loading="lazy" />
                <span className="play">▶</span>
                <span className="cap">7 თუ 9 ცხენის ძალა?</span>
              </div>
            </div>
            <footer><span>მოწონება</span><span>კომენტარი</span><span>გაზიარება</span></footer>
            <em className="vk-share-cap">ბრენდის გვერდი · გაზიარების მაგალითი</em>
          </article>
        </div>

        <p className="vk-disclose" data-reveal>
          <span className="dot" /> ვალიკო ყველა არხზე ღიად არის მონიშნული როგორც AI პერსონაჟი — Meta-სა და TikTok-ის წესების შესაბამისად. ნდობა გამჭვირვალობით იწყება.
        </p>
      </div>
    </section>
  );
}

function Top({ rubric }: { rubric: string }) {
  return (
    <div className="vk-reel-t">
      <span className="h">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PORTRAIT} alt="" />
        @valiko.ai
      </span>
      <em>{rubric}</em>
    </div>
  );
}

function Side() {
  return (
    <div className="vk-reel-s" aria-hidden="true">
      <i>♥</i>
      <i>✎</i>
      <i>↗</i>
    </div>
  );
}
