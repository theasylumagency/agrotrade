import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "აგრო თრეიდი × ASILUMI — კომერციული შეთავაზება",
  description: "ნუ დაგვიჯერებთ — შეამოწმეთ. მოქმედი პროტოტიპი აგრო თრეიდის 217 რეალური პროდუქტით: ახალი ვიტრინა, ერთი ძრავი ორი ბრენდისთვის და ცოცხალი AI კონსულტანტი ვალიკო.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "აგრო თრეიდი × ASILUMI",
    description: "ნუ დაგვიჯერებთ — შეამოწმეთ. მოქმედი პროტოტიპი თქვენი 217 რეალური პროდუქტით.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    locale: "ka_GE",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0b0c09", colorScheme: "dark" };

// Fonts are self-hosted from /public/fonts (SIL OFL) — no dependency on Google at runtime.
const PRELOAD = ["/fonts/nserg-geo.woff2", "/fonts/nsg-geo.woff2", "/fonts/jbm.woff2"];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ka">
      <head>
        {PRELOAD.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
