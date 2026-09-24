import "server-only";
import type { CatKey, Product } from "@/lib/catalog";
import { STORES } from "@/lib/catalog";
import { byId, catalog } from "./knowledge";

/**
 * Offline Valiko: a rule-based advisor that works without any AI key.
 * Used when no API key is configured or the AI provider fails, so the demo never breaks.
 */

type Msg = { role: "user" | "assistant"; content: string };

const items = catalog.items.filter((p) => p.p > 0 && !p.t);
const g = (n: number) => `${Math.round(n).toLocaleString("en-US")} ₾`;
const tok = (p: Product) => `${p.n} [[#${p.id}]] — ${g(p.p)}${p.st ? "" : " (მარაგი ივსება)"}`;

const CAT_RX: [CatKey, RegExp][] = [
  ["atv", /კვადრო/],
  ["milk", /საწველ|ძროხ|რძე|მოწველ/],
  ["mill", /საფქვავ|დაფქვ|სიმინდ|მარცვ|ფურაჟ|კაკალ|კაკლ|თხილ|წვენ|საფშვნ/],
  ["spray", /შეწამვლ|შესხურ|შემასხურ|წამლ|ვენახ|ბაღის დამუშ|ტუმბო|მორწყ/],
  ["mow", /სათიბ|ბალახ|გაზონ|საკრეჭ|თიბვ/],
  ["power", /გენერატ|დენი|დენის|შუქი|ძრავი/],
  ["saw", /ხერხ|შეშ|ტოტ|ხე ?ხ/],
  ["drill", /ბურღ|ორმო|ნერგ/],
  ["tire", /საბურავ|ბორბალ|კამერა/],
  ["attach", /მისაბმელ|ურიკ|გუთან|კარტოფილ|საკვალ/],
  ["moto", /მოტობლოკ|კულტივატ|ხვნ|მიწის დამუშ|ბოსტან|ნაკვეთ|სოტკ|ჰექტ|ცხ\.?\s?ძ|ცხენ|ტრაქტ|ფრეზ/],
];

function parse(all: string) {
  const t = all.toLowerCase();
  const budgetM = t.match(/(\d[\d\s]{2,6})\s*(?:ლარ|₾|gel|-?მდე)/);
  const budget = budgetM ? Number(budgetM[1].replace(/\s/g, "")) : null;
  const sotkaM = t.match(/(\d+(?:[.,]\d+)?)\s*სოტკ/);
  const haM = t.match(/(\d+(?:[.,]\d+)?)\s*(?:ჰა\b|ჰექტ)/);
  const area = sotkaM ? Number(sotkaM[1].replace(",", ".")) : haM ? Number(haM[1].replace(",", ".")) * 100 : null;
  const hpM = t.match(/(\d{1,2})\s*(?:ცხ|hp|ცხენ)/);
  const hp = hpM ? Number(hpM[1]) : null;
  const fuel = /დიზელ/.test(t) ? "დიზელი" : /ბენზინ/.test(t) ? "ბენზინი" : null;
  return { t, budget, area, hp, fuel };
}

function pick(list: Product[], n = 3) {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of list) {
    const k = p.n.replace(/\s+/g, "").toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
    if (out.length >= n) break;
  }
  return out;
}

const pref = (a: Product, b: Product) => Number(b.st) - Number(a.st) || Number(b.im) - Number(a.im);

function motoAdvice(q: ReturnType<typeof parse>) {
  let pool = items.filter((p) => p.c === "moto" && !/ძრავი/.test(p.n));
  let reason = "";
  let band: "mini" | "7" | "9" | "15" = "7";
  if (q.hp) band = q.hp <= 3 ? "mini" : q.hp < 8 ? "7" : q.hp < 11 ? "9" : "15";
  else if (q.area != null) band = q.area <= 15 ? "mini" : q.area <= 50 ? "7" : q.area <= 100 ? "9" : "15";
  if (band === "mini") {
    pool = pool.filter((p) => /მინიკულტივატორ/.test(p.n));
    reason = "პატარა ნაკვეთისა და ვიწრო რიგებისთვის მძიმე მოტობლოკი ზედმეტია — მინიკულტივატორი ბევრად მოქნილია";
  } else if (band === "7") {
    pool = pool.filter((p) => p.hp != null && p.hp >= 5 && p.hp < 8 && !/მინიკულტივატორ/.test(p.n));
    reason = "7 ცხ.ძ. საკმარისზე მეტია და ზედმეტ ფულს არ გადაიხდი";
  } else if (band === "9") {
    pool = pool.filter((p) => p.hp != null && p.hp >= 8 && p.hp < 11);
    reason = "ამ ფართობზე და მძიმე მიწაზე 9 ცხ.ძ. და მსხვილი ღერძი იმუშავებს დაუღალავად";
  } else {
    pool = pool.filter((p) => p.hp != null && p.hp >= 11);
    reason = "დიდ ფართობზე და მისაბმელით მუშაობისთვის 12–15 ცხ.ძ. გჭირდება, დიზელი კი ხანგრძლივ მუშაობაზე უფრო ეკონომიურია";
  }
  if (q.fuel) pool = pool.filter((p) => p.f === q.fuel);
  if (q.budget) pool = pool.filter((p) => p.p <= q.budget!);
  pool.sort((a, b) => pref(a, b) || a.p - b.p);
  const chosen = pick(pool, 3);
  const where = q.area != null ? `${q.area >= 100 ? `${q.area / 100} ჰექტარზე` : `${q.area} სოტკაზე`}` : null;
  if (!chosen.length)
    return `ამ პირობებით${q.budget ? ` ${g(q.budget)}-მდე` : ""} ზუსტად შესაფერისი ვერ ვიპოვე. ცოტას თუ გადავწევთ ბიუჯეტს ან სიმძლავრეს, ვარიანტები გამოჩნდება. რამდენი სოტკაა და როგორი მიწა — მსუბუქი თუ თიხნარი?`;
  return `${where ? `${where} ` : ""}${reason}. ჩემი არჩევანი:\n${chosen.map((p) => `• ${tok(p)}`).join("\n")}\n${q.area == null ? "რამდენი სოტკაა და რას ამუშავებ? ზუსტად მაშინ გეტყვი." : "თუ მიწა მძიმე და თიხნარია, ერთი საფეხურით ძლიერს აგირჩევდი."}`;
}

function catAdvice(c: CatKey, q: ReturnType<typeof parse>) {
  let pool = items.filter((p) => p.c === c);
  if (q.budget) pool = pool.filter((p) => p.p <= q.budget!);
  if (c === "spray" && /შეწამვლ|შესხურ|შემასხურ|წამლ|ვენახ/.test(q.t)) pool = pool.filter((p) => /შემასხურ|შესასხურ/.test(p.n));
  if (c === "spray" && /ვენახ|ჰექტ|ჰა\b/.test(q.t)) pool.sort((a, b) => pref(a, b) || b.p - a.p);
  else if (c === "atv") pool.sort((a, b) => pref(a, b) || b.p - a.p);
  else pool.sort((a, b) => pref(a, b) || a.p - b.p);
  const chosen = pick(pool, 3);
  const intro: Partial<Record<CatKey, string>> = {
    atv: "კვადროციკლი საქმისთვის თუ გასართობად? სამუშაოდ 200CC-დან ზემოთ ავიღებდი. აი, რა გვაქვს:",
    milk: "საწველი აპარატი ძროხების რაოდენობის მიხედვით ირჩევა: 1–3 ძროხაზე ერთსისტემიანიც კმარა. ვარიანტები:",
    mill: "საფქვავი იმის მიხედვით ირჩევა, რას ფქვავ — მარცვალს, სიმინდს თუ ბალახს. აი, რამდენიმე:",
    spray: "შეწამვლისთვის: პატარა ბაღს ზურგის ელექტრო შემასხურებელი ყოფნის, დიდ ბაღსა და ვენახს — ბენზინზე მომუშავე. ვარიანტები:",
    mow: "სათიბი ფართობისა და ბალახის სიმაღლის მიხედვით. ვარიანტები:",
    power: "გენერატორი იმის მიხედვით აირჩიე, რისი ჩართვა გინდა ერთდროულად. ვარიანტები:",
    saw: "შეშისთვის და ტოტებისთვის ბენზოხერხი საუკეთესოა. ვარიანტები:",
    drill: "ნერგებისთვის ორმოს ბურღი დროს უზომოდ დაგიზოგავს. ვარიანტები:",
    tire: "საბურავი ზომით ირჩევა — ძველზე ზომა წერია (მაგ. 4.00-8). ვარიანტები:",
    attach: "მოტობლოკს მისაბმელი ორჯერ მეტ საქმეს აკეთებინებს. ვარიანტები:",
    tools: "სახელოსნოსთვის:",
  };
  if (!chosen.length) return "ამ ბიუჯეტში ვერაფერი ვიპოვე. მითხარი, რისთვის გჭირდება და ერთად მოვძებნოთ.";
  return `${intro[c] ?? "აი, რა გვაქვს:"}\n${chosen.map((p) => `• ${tok(p)}`).join("\n")}\nრისთვის გჭირდება ზუსტად? უკეთ შეგირჩევ.`;
}

function mentioned(text: string): Product[] {
  const codes = text.toUpperCase().match(/\b[A-Z]{0,3}-?\d{2,4}[A-Z0-9-]*\b/g) ?? [];
  const found: Product[] = [];
  for (const raw of codes) {
    const c = raw.replace(/-+$/, "");
    if (c.length < 3 || !/[A-Z]/.test(c)) continue;
    const hits = items.filter((p) => p.n.toUpperCase().includes(c));
    hits.sort(pref).slice(0, 1).forEach((h) => found.push(h));
  }
  return found;
}

function lastProduct(msgs: Msg[]): Product | null {
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = [...msgs[i].content.matchAll(/\[\[#(\d+)\]\]/g)];
    if (m.length) return byId.get(Number(m[0][1])) ?? null;
    const p = mentioned(msgs[i].content)[0];
    if (p) return p;
  }
  return null;
}

export function fallbackReply(msgs: Msg[]): string {
  const userText = msgs.filter((m) => m.role === "user").map((m) => m.content).join(" \n ");
  const last = msgs.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const q = parse(userText);
  const l = last.toLowerCase();

  if (/^(გამარჯობა|სალამი|hello|hi|გაუმარჯოს)[!. ]*$/.test(l.trim()))
    return "გაუმარჯოს! ვალიკო ვარ. მითხარი, რა გაქვს — ბოსტანი, ბაღი, ვენახი თუ მინდორი, და დაახლოებით რამდენი სოტკა? ზუსტად იმას შეგირჩევ, რაც გჭირდება, და არაფერს ზედმეტს.";
  if (/ვინ ხარ|ადამიანი ხარ|რობოტ|ბოტი ხარ|ai ხარ/.test(l))
    return "მე ვალიკო ვარ — AI მრჩეველი. აგრო თრეიდის მთელ კატალოგს ვიცნობ: ფასებს, მახასიათებლებს, მარაგს. ცოცხალი გუნდიც ახლოსაა — როცა მზად იქნები, გადაგაბარებ.";
  if (/სად|მისამართ|მაღაზი|ფილიალ|გადმოვიდე|მოვიდე/.test(l))
    return `სამი მაღაზია გვაქვს:\n${STORES.map((s) => `• ${s.city} — ${s.addr}`).join("\n")}\nმიტანაც შეიძლება — პირობებს გაყიდვების გუნდი დაგიზუსტებს. გადავცე მათ შენი ნომერი?`;
  if (/განვადებ|სესხ|თვეში|ყოველთვიურ|კრედიტ/.test(l)) {
    const p = mentioned(last)[0] ?? lastProduct(msgs);
    const base = "განვადება შეგიძლია საქართველოს ბანკით, თიბისით ან კრედო ბანკით.";
    if (p)
      return `${base} მაგალითად ${tok(p)}: დაახლოებით ${g(Math.ceil(p.p / 12))}/თვე 12 თვეზე ან ${g(Math.ceil(p.p / 24))}/თვე 24 თვეზე — ეს საორიენტაციოა, პროცენტის გარეშე. ზუსტ პირობებს ბანკი ადგენს. გადავცე გაყიდვების გუნდს?`;
    return `${base} ზუსტ პირობებს ბანკი ადგენს. რომელი ტექნიკა გაინტერესებს? გამოგითვლი დაახლოებით თვეში რამდენი გამოვა.`;
  }
  if (/7 თუ 9|9 თუ 7|რა განსხვავება|რითი განსხვავდ/.test(l) && /ცხ|ცხენ|7|9/.test(l))
    return "მოკლედ: 7 ცხ.ძ. — 50 სოტკამდე, მსუბუქ და საშუალო მიწაზე; მსუბუქია და ადვილად სამართავი. 9 ცხ.ძ. — უფრო დიდ ფართობზე და მძიმე, თიხნარ მიწაზე, განსაკუთრებით მსხვილღერძიანი. თუ 7 გყოფნის, 9-ში ფულს ნუ გადაიხდი. რამდენი სოტკაა?";

  const direct = mentioned(last);
  if (direct.length) {
    const p = direct[0];
    const specs = p.s.filter(([k]) => /სიგანე|სიღრმე|წონა|გარანტია|მოცულობა|სიმძლავრე|დატვირთვა/.test(k)).slice(0, 3).map(([k, v]) => `${k.toLowerCase()} ${v}`).join(", ");
    const alt = items.filter((x) => x.c === p.c && x.id !== p.id && Math.abs(x.p - p.p) < p.p * 0.35).sort(pref)[0];
    return `${tok(p)}.${specs ? ` ${specs}.` : ""}${p.hp && !/ცხ/.test(p.n) ? ` ${p.hp} ცხ.ძ.${p.f ? `, ${p.f}` : ""}.` : ""}${alt ? `\nშესადარებლად ნახე ${tok(alt)}.` : ""}\nრა სამუშაოსთვის გჭირდება? გეტყვი, ღირს თუ არა.`;
  }

  for (const [c, rx] of CAT_RX) {
    if (rx.test(l)) return c === "moto" ? motoAdvice(q) : catAdvice(c, q);
  }
  if (q.area != null || q.hp != null) return motoAdvice(q);
  if (q.budget) {
    const pool = items.filter((p) => p.c === "moto" && p.p <= q.budget! && p.hp).sort((a, b) => pref(a, b) || b.p - a.p);
    if (pool.length) return `${g(q.budget)}-მდე ყველაზე ძლიერი ვარიანტები:\n${pick(pool, 3).map((p) => `• ${tok(p)}`).join("\n")}\nრამდენი სოტკა გაქვს? იქნებ უფრო იაფიც გეყოს.`;
  }
  return "ზუსტად რომ შეგირჩიო, ორი რამ მითხარი: რა გაქვს (ბოსტანი, ბაღი, ვენახი, მინდორი) და დაახლოებით რამდენი სოტკა? ბიუჯეტიც თუ გაქვს გათვლილი, კიდევ უკეთესი.";
}

export function fallbackLead(msgs: Msg[]) {
  const userText = msgs.filter((m) => m.role === "user").map((m) => m.content).join(" ");
  const q = parse(userText);
  const ids = new Set<number>();
  for (const m of msgs) for (const x of m.content.matchAll(/\[\[#(\d+)\]\]/g)) ids.add(Number(x[1]));
  const products = [...ids].filter((id) => byId.has(id)).slice(0, 3);
  const pay = /განვადებ/.test(q.t) ? "განვადება" : /ნაღდ|ბარათ/.test(q.t) ? "ერთიანად" : null;
  const firstUser = msgs.find((m) => m.role === "user")?.content ?? "";
  return {
    need: firstUser.length > 140 ? firstUser.slice(0, 140) + "…" : firstUser,
    area: q.area != null ? (q.area >= 100 ? `${q.area / 100} ჰა` : `${q.area} სოტკა`) : null,
    crop: ({ ბოსტან: "ბოსტანი", ვენახ: "ვენახი", ბაღ: "ბაღი", ხორბალ: "ხორბალი", სიმინდ: "სიმინდი", კარტოფილ: "კარტოფილი" } as Record<string, string>)[q.t.match(/ბოსტან|ვენახ|ბაღ|ხორბალ|სიმინდ|კარტოფილ/)?.[0] ?? ""] ?? null,
    budget: q.budget ? g(q.budget) : null,
    payment: pay,
    products,
    urgency: /დღეს|ხვალ|სასწრაფ|ახლავე|ამ კვირ/.test(q.t) ? "მაღალი" : products.length ? "საშუალო" : "დაბალი",
    next: products.length ? "დაურეკეთ 24 საათში, დაადასტურეთ მოდელი და შესთავაზეთ განვადების პირობები." : "დაურეკეთ და დააზუსტეთ ფართობი, სამუშაო და ბიუჯეტი.",
    summary: `მომხმარებელი ეძებს ტექნიკას${q.area != null ? ` ${q.area >= 100 ? `${q.area / 100} ჰა` : `${q.area} სოტკა`} ფართობისთვის` : ""}${q.budget ? `, ბიუჯეტი ~${g(q.budget)}` : ""}. ვალიკომ შესთავაზა ${products.length} ვარიანტი.`,
  };
}
