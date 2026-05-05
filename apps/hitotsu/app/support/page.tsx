import type { Metadata } from "next";
import Link from "next/link";
import { DonateForm } from "@/components/donate-form";

export const metadata: Metadata = {
  title: "サポート — ひとつ",
  description:
    "ひとつ の運営をご支援いただける方へ。任意金額のワンタイムサポートを受け付けています。",
};

export default function SupportPage() {
  return (
    <main className="min-h-screen px-6 py-16 sm:px-12 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10">
          <Link
            href="/"
            className="text-xs tracking-[0.3em] text-sakura-300 uppercase hover:text-sage-700 transition-colors"
          >
            ← ひとつ
          </Link>
          <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight text-sage-900">
            ひとつ をサポートする
          </h1>
        </header>

        <section className="mb-12 text-sage-700 leading-[1.9] space-y-5">
          <p>
            「ひとつ」 は、ADHD・不登校・通信制・留年などの当事者と、そのご家族が、AI と一緒に「今日のひとつ」を続けるためのサービスです。
          </p>
          <p>
            運営費 (Anthropic API 利用料、サーバー、開発時間、メール送信) は、月額サブスクリプション (¥1,480) と、皆さまからのサポートで支えられています。
          </p>
          <p>
            「今は契約が難しいけど応援したい」「以前お世話になったから恩返しを」 — そんな気持ちで使っていただけたら幸いです。少額でも、ひとつ を続けるための大きな力になります。🌱
          </p>
        </section>

        <section className="border border-cream-300 rounded-xl p-7 bg-cream-50 mb-12">
          <DonateForm />
        </section>

        <section className="text-xs text-sage-500 leading-[1.9] space-y-3 border-t border-cream-200 pt-8">
          <p className="font-medium text-sage-700">運営</p>
          <p>
            屋号: V-Corp / 代表: 遠藤 新大 / メール:{" "}
            <a
              href="mailto:info@v-corp.inc"
              className="underline hover:text-sage-700"
            >
              info@v-corp.inc
            </a>
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
            <a
              href="https://v-corp.inc/legal/terms"
              className="underline hover:text-sage-700"
              target="_blank"
              rel="noreferrer"
            >
              利用規約
            </a>
            <a
              href="https://v-corp.inc/legal/privacy"
              className="underline hover:text-sage-700"
              target="_blank"
              rel="noreferrer"
            >
              プライバシー
            </a>
            <a
              href="https://v-corp.inc/legal/tokushoho"
              className="underline hover:text-sage-700"
              target="_blank"
              rel="noreferrer"
            >
              特定商取引法に基づく表記
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
