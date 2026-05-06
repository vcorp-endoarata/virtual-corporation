import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false, // 日本語フォントは大きいため preload しない
  variable: "--font-zen-maru-gothic",
});

export const metadata: Metadata = {
  title: "よりそい — 発達障害に悩む人々の安らぎの場",
  description:
    "ADHD・ASD・トゥレット症候群など、発達障害を持つ人と、その家族・身近な人たちが、" +
    "比較せず、攻撃せず、ただ寄り添える場所。",
  metadataBase: new URL("https://yorisoi.community"),
  openGraph: {
    title: "よりそい",
    description: "発達障害に悩む人々の安らぎの場",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: "よりそい",
    description: "発達障害に悩む人々の安らぎの場",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={zenMaruGothic.variable}>
      <body className="min-h-screen bg-cream font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
