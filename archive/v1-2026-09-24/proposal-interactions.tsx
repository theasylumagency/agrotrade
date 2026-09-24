"use client";

import { useState } from "react";
import Image from "next/image";

const platforms = {
  new: { number: "01", label: "ახალი ბრენდი", eyebrow: "ახალი სავაჭრო პლატფორმა", title: "ახალი სახე. ახალი გამოცდილება.", description: "საკუთარი სახელით, იდენტობით, დიზაინითა და კომუნიკაციით შექმნილი სრულფასოვანი სავაჭრო სისტემა.", mockTitle: "ტექნიკა, რომელიც საქმეს აკეთებს.", mockEyebrow: "ახალი ბრენდი / ონლაინ კატალოგი", tags: ["კატალოგი და ფილტრები", "ონლაინ შეკვეთა", "გადახდა და განვადება"] },
  agro: { number: "02", label: "აგრო ტრეიდი", eyebrow: "არსებული დომენი / ახალი ვიტრინა", title: "ნაცნობი ბრენდი. ახალი შესაძლებლობა.", description: "აგრო ტრეიდის არსებულ დომენზე ახალი სავაჭრო ვიტრინა — დამოუკიდებელი ვიზუალური გარემოთი და იმავე ძლიერი ტექნოლოგიური ძრავით.", mockTitle: "აგრო ტრეიდი, ახლა ონლაინაც.", mockEyebrow: "AGRO TRADE / სავაჭრო სივრცე", tags: ["საერთო პროდუქტის ბაზა", "ერთიანი ადმინისტრირება", "საკუთარი ვიზუალური ენა"] },
} as const;

export function PlatformExperience() {
  const [active, setActive] = useState<keyof typeof platforms>("new");
  const item = platforms[active];
  return <div className="platform-experience">
    <div className="platform-details"><div className="platform-tabs" role="tablist" aria-label="სავაჭრო ვიტრინები">{(Object.keys(platforms) as Array<keyof typeof platforms>).map((key) => <button key={key} type="button" role="tab" aria-selected={active === key} onClick={() => setActive(key)} className={active === key ? "active" : ""}><span>{platforms[key].number}</span>{platforms[key].label}</button>)}</div><div className="platform-text" role="tabpanel"><span className="section-kicker">{item.eyebrow}</span><h3>{item.title}</h3><p>{item.description}</p><ul>{item.tags.map((tag) => <li key={tag}><span aria-hidden="true">↗</span>{tag}</li>)}</ul></div><div className="platform-switch-note">შეცვალეთ ვიტრინა ზედა ღილაკებით <span>↗</span></div></div>
    <div className={`platform-preview ${active === "agro" ? "is-agro" : ""}`} aria-label={`${item.label} — ვიზუალური კონცეფციის ილუსტრაცია`}><div className="preview-browser"><span /><span /><span /><small>preview / {active === "new" ? "new-brand" : "agro-trade"}</small></div><div className="preview-site"><div className="preview-nav"><strong>{active === "new" ? "N / B" : "AGRO TRADE"}</strong><div><i /><i /><i /></div><span>⌕　☰</span></div><div className="preview-hero"><Image src="/images/agro-field.webp" alt="" fill sizes="(max-width: 800px) 100vw, 55vw" /><div><span>{item.mockEyebrow}</span><strong>{item.mockTitle}</strong><small>კატალოგის ნახვა　↗</small></div></div><div className="preview-catalog"><div><b>კატეგორიები</b><span>ყველა პროდუქტი →</span></div><div className="preview-product-grid"><div><span>01 / ტექნიკა</span><b>მთავარი კატეგორია</b></div><div><span>02 / ნაწილები</span><b>პროდუქტები</b></div><div><span>03 / აქსესუარები</span><b>მეტი არჩევანი</b></div></div></div></div><div className="preview-caption">საიტის ვიზუალური კონცეფციის ილუსტრაცია <span>↗</span></div></div>
  </div>;
}

const examples = [
  { question: "90 თუ 110 ცხენის ძალა?", answer: "თუ შენი აღწერილი სამუშაოსთვის 90 საკმარისია, მეტში ფულს ნუ გადაიხდი. ჯერ ფართობი და სამუშაოს ტიპი გავარკვიოთ." },
  { question: "რა ტექნიკა მჭირდება?", answer: "რას ამუშავებ და დაახლოებით რამდენ ჰექტარს? აქედან დავიწყოთ — მერე უკვე ზუსტად შევადარებთ ვარიანტებს." },
];

export function ValikoExample() {
  const [active, setActive] = useState(0);
  return <div className="valiko-demo"><div className="demo-heading"><span className="valiko-led" /> საუბრის სცენარის მაგალითი <span>↗</span></div><div className="demo-question">„{examples[active].question}“</div><div className="demo-answer">„{examples[active].answer}“</div><div className="demo-options">{examples.map((item, index) => <button type="button" key={item.question} onClick={() => setActive(index)} aria-pressed={active === index}>{index === 0 ? "შედარება" : "შერჩევა"}</button>)}</div></div>;
}

export function PrintButton() {
  return <button type="button" className="footer-print" onClick={() => window.print()}>შეთავაზების შენახვა / PDF <span>↗</span></button>;
}
