import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "აგრო ტრეიდი × ასილუმი — კომერციული შეთავაზება",
  description: "ორი სავაჭრო ვიტრინა, ერთი ტექნოლოგიური ბირთვი, ახალი ბრენდი და ვალიკო AI — კომერციული შეთავაზება აგრო ტრეიდისთვის.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="ka"><body>{children}</body></html>;
}
