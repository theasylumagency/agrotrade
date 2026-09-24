import type { BrandKey } from "@/lib/brands";

/** Simple concept monograms for the three brand names + Agro Trade. */
export function BrandMark({ brand, size = 28 }: { brand: BrandKey; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 32 32", fill: "none", "aria-hidden": true } as const;
  if (brand === "gutani")
    return (
      <svg {...common}>
        <path d="M6 25c7-1 13-5 17-13l3-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M5 26c3-6 8-9 15-9-2 5-7 8-15 9Z" fill="currentColor" />
        <path d="M24 9h5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  if (brand === "kvali")
    return (
      <svg {...common}>
        <path d="M4 7l8 9-8 9M13 7l8 9-8 9M22 7l8 9-8 9" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="miter" />
      </svg>
    );
  if (brand === "mitsa")
    return (
      <svg {...common}>
        <path d="M9 15a7 7 0 0 1 14 0Z" fill="currentColor" />
        <path d="M3 20c5-2.2 21-2.2 26 0M5 24.5c4.5-1.6 17.5-1.6 22 0M8 28.5c4-.9 12-.9 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="3" y="3" width="26" height="26" rx="6" fill="currentColor" />
      <path d="M10 22c0-7 5-12 13-12-1 8-6 12-13 12Zm0 0 7-7" stroke="var(--s-bg, #fff)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
