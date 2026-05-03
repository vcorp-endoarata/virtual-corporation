import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "V-Corp — Virtual Corporation",
  description: "ひとり と AI で動く、小さな仮想企業。",
  metadataBase: new URL("https://v-corp.inc"),
  openGraph: {
    title: "V-Corp — Virtual Corporation",
    description: "ひとり と AI で動く、小さな仮想企業。",
    url: "https://v-corp.inc",
    siteName: "V-Corp",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "V-Corp — Virtual Corporation",
    description: "ひとり と AI で動く、小さな仮想企業。",
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
