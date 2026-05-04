import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ひとつ — 今日やる 1 つだけ、AI が決めてくれる",
  description:
    "留年・不登校・通信制・発達特性で『何から手を付けるか』が固まる人のための、AI 学習伴走 SaaS。",
  metadataBase: new URL("https://hitotsu.v-corp.inc"),
  openGraph: {
    title: "ひとつ — 今日やる 1 つだけ、AI が決めてくれる",
    description:
      "留年・不登校・通信制・発達特性で『何から手を付けるか』が固まる人のための、AI 学習伴走 SaaS。",
    url: "https://hitotsu.v-corp.inc",
    siteName: "ひとつ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ひとつ — 今日やる 1 つだけ、AI が決めてくれる",
    description:
      "留年・不登校・通信制・発達特性で『何から手を付けるか』が固まる人のための、AI 学習伴走 SaaS。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
