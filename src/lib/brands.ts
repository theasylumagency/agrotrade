export type BrandKey = "gutani" | "kvali" | "mitsa" | "agro";

export type Brand = {
  key: BrandKey;
  latin: string;
  ka: string;
  domain: string;
  concept: boolean;
  meaning: string;
  personality: string;
  tagline: string;
  heroTitle: string;
  heroSub: string;
  heroProduct: number;
  cta: string;
  vars: Record<string, string>;
};

export const BRANDS: Brand[] = [
  {
    key: "gutani",
    latin: "GUTANI",
    ka: "გუთანი",
    domain: "gutani.ge",
    concept: true,
    meaning: "გუთანი — ქართული მიწათმოქმედების უძველესი იარაღი.",
    personality: "მემკვიდრეობა · სანდოობა · სიმძიმე",
    tagline: "ტექნიკა მიწისთვის, რომელსაც ენდობი",
    heroTitle: "მიწა ელოდება.\nტექნიკა მზადაა.",
    heroSub: "მოტობლოკები, კულტივატორები და აგროტექნიკა — გარანტიით, განვადებით და სამ მაღაზიაში.",
    heroProduct: 8810,
    cta: "კატალოგის ნახვა",
    vars: {
      "--s-bg": "#f3ede1",
      "--s-surface": "#fffdf8",
      "--s-well": "#ffffff",
      "--s-ink": "#1f1a12",
      "--s-muted": "#76695a",
      "--s-line": "#e1d6c3",
      "--s-accent": "#a8741f",
      "--s-accent-ink": "#fffaf0",
      "--s-hero": "#1f1a12",
      "--s-hero-ink": "#f3e6c9",
      "--s-chip": "#ebe2d2",
      "--s-radius": "3px",
      "--s-display": "var(--f-serif)",
      "--s-display-wdth": "82",
      "--s-display-wght": "700",
      "--s-wordmark": "var(--f-gutani)",
      "--s-wordmark-spacing": "0.14em",
    },
  },
  {
    key: "kvali",
    latin: "KVALI",
    ka: "კვალი",
    domain: "kvali.ge",
    concept: true,
    meaning: "კვალი — ის, რასაც ძლიერი ტექნიკა მიწაზე ტოვებს.",
    personality: "ძალა · სიზუსტე · თანამედროვეობა",
    tagline: "ძლიერი ტექნიკა. მკაფიო ფასი.",
    heroTitle: "დატოვე\nკვალი.",
    heroSub: "15 ცხ.ძ.-მდე სიმძლავრე, დიზელი და ბენზინი. შეარჩიე 30 წამში — ან ჰკითხე ვალიკოს.",
    heroProduct: 8803,
    cta: "შეარჩიე ტექნიკა",
    vars: {
      "--s-bg": "#0d0e0f",
      "--s-surface": "#16181a",
      "--s-well": "#eceae6",
      "--s-ink": "#f1f0ec",
      "--s-muted": "#8d9196",
      "--s-line": "#2a2d31",
      "--s-accent": "#ff5b1f",
      "--s-accent-ink": "#0d0e0f",
      "--s-hero": "#ff5b1f",
      "--s-hero-ink": "#0d0e0f",
      "--s-chip": "#202326",
      "--s-radius": "0px",
      "--s-display": "var(--f-sans)",
      "--s-display-wdth": "68",
      "--s-display-wght": "900",
      "--s-wordmark": "var(--f-kvali)",
      "--s-wordmark-spacing": "0.02em",
    },
  },
  {
    key: "mitsa",
    latin: "MITSA",
    ka: "მიწა",
    domain: "mitsa.ge",
    concept: true,
    meaning: "მიწა — ყველაფრის დასაწყისი და ყველა ფერმერის საერთო ენა.",
    personality: "სითბო · სიახლოვე · ოჯახური მეურნეობა",
    tagline: "სწორი ტექნიკა შენი მიწისთვის",
    heroTitle: "შენი მიწა.\nშენი ტექნიკა.",
    heroSub: "ბოსტნიდან ჰექტრებამდე — გეტყვით ზუსტად რა გჭირდება და არაფერს ზედმეტს.",
    heroProduct: 8816,
    cta: "დაიწყე შერჩევა",
    vars: {
      "--s-bg": "#f6f2e7",
      "--s-surface": "#ffffff",
      "--s-well": "#ffffff",
      "--s-ink": "#1f3322",
      "--s-muted": "#6b7a68",
      "--s-line": "#e4e0d2",
      "--s-accent": "#2f7d4a",
      "--s-accent-ink": "#ffffff",
      "--s-hero": "#2f7d4a",
      "--s-hero-ink": "#fff8e6",
      "--s-chip": "#ece6d4",
      "--s-radius": "18px",
      "--s-display": "var(--f-sans)",
      "--s-display-wdth": "100",
      "--s-display-wght": "800",
      "--s-wordmark": "var(--f-mitsa)",
      "--s-wordmark-spacing": "-0.01em",
    },
  },
  {
    key: "agro",
    latin: "AGRO TRADE",
    ka: "აგრო თრეიდი",
    domain: "agro-trade.ge",
    concept: false,
    meaning: "თქვენი არსებული ბრენდი — თქვენს არსებულ დომენზე, ახალ ძრავზე.",
    personality: "ნაცნობი სახელი · ახალი სისტემა",
    tagline: "ტექნიკა სამ მაღაზიაში — თბილისი, ოკამი, ზესტაფონი",
    heroTitle: "აგრო თრეიდი.\nახალ სისტემაზე.",
    heroSub: "იგივე პროდუქტი, იგივე საწყობი, იგივე გუნდი — ახალი ვიტრინით, ონლაინ განვადებით და სწრაფი შეკვეთით.",
    heroProduct: 7763,
    cta: "პროდუქცია",
    vars: {
      "--s-bg": "#ffffff",
      "--s-surface": "#f4f6f3",
      "--s-well": "#ffffff",
      "--s-ink": "#132a1c",
      "--s-muted": "#62725f",
      "--s-line": "#e1e7df",
      "--s-accent": "#1d7a3a",
      "--s-accent-ink": "#ffffff",
      "--s-hero": "#0f3a22",
      "--s-hero-ink": "#ffffff",
      "--s-chip": "#eaf0e8",
      "--s-radius": "8px",
      "--s-display": "var(--f-sans)",
      "--s-display-wdth": "88",
      "--s-display-wght": "800",
      "--s-wordmark": "var(--f-sans)",
      "--s-wordmark-spacing": "0.08em",
    },
  },
];

export const brandByKey = (k: BrandKey) => BRANDS.find((b) => b.key === k)!;
