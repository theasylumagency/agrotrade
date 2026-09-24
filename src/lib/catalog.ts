export type CatKey = "moto" | "atv" | "mow" | "spray" | "mill" | "milk" | "power" | "saw" | "drill" | "tire" | "attach" | "tools";

export type Product = {
  id: number;
  /** name */ n: string;
  /** price, GEL */ p: number;
  /** clean category */ c: CatKey;
  /** brand */ b: string | null;
  /** horse power */ hp: number | null;
  /** fuel */ f: string | null;
  /** axle type (motoblocks) */ ax: string | null;
  /** spec pairs */ s: [string, string][];
  /** description */ d: string;
  /** in stock */ st: boolean;
  /** original url on agro-trade.ge */ u: string;
  /** has photo */ im: boolean;
  t: boolean;
};

export type Catalog = { cats: [CatKey, string][]; items: Product[]; fetchedAt: string };

let cache: Promise<Catalog> | null = null;
/** Lazy-loads the catalog as a separate chunk the first time it's needed. */
export function loadCatalog(): Promise<Catalog> {
  if (!cache) cache = import("@/data/catalog.json").then((m) => (m.default ?? m) as unknown as Catalog);
  return cache;
}

export const gel = (v: number) => `${Math.round(v).toLocaleString("en-US")} ₾`;
export const gelExact = (v: number) => `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })} ₾`;

/** Indicative monthly payment without interest — real terms are set by the bank. */
export const monthly = (price: number, months: number) => Math.ceil(price / months);

export const imgS = (id: number) => `/catalog/s/${id}.webp`;
export const imgM = (id: number) => `/catalog/m/${id}.webp`;

export const BANKS = ["საქართველოს ბანკი", "თიბისი", "კრედო ბანკი"] as const;

export const STORES = [
  { city: "თბილისი", addr: "წერეთლის გამზ. N147", note: "მთავარი საწყობი და მაღაზია" },
  { city: "ოკამი", addr: "თბილისი–ლესელიძის მე-40 კმ", note: "მაღაზია" },
  { city: "ზესტაფონი", addr: "რუსთაველის ქ. N60", note: "მაღაზია" },
] as const;
