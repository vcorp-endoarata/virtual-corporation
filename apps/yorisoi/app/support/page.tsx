import Link from "next/link";
import { DonateForm } from "@/components/DonateForm";

export const metadata = {
  title: "よりそい をサポートする — よりそい",
  description:
    "発達障害の当事者と家族のためのコミュニティ「よりそい」の運営にご協力ください。",
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-xl px-4 py-12 md:py-20">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-sumi hover:text-sage"
        >
          ← ホームに戻る
        </Link>

        <h1 className="mt-8 font-display text-3xl text-ink md:text-4xl">
          よりそい をサポートする
        </h1>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-sumi md:text-base">
          <p>
            「よりそい」 は、発達障害 (ADHD・ASD・トゥレット症候群) の当事者と、
            家族・身近な人が、評価や否定のない場所で
            ゆっくり寄り添い合えるコミュニティです。
          </p>
          <p>
            運営費 (サーバー、メール送信、AI 安全性検査、開発時間) は、
            月額サブスクリプション (¥300) と、皆さまからのサポートで支えられています。
          </p>
          <p>
            利用料を払えない当事者の場所を、あなたのサポートが守ってくれます。
            少額でも、大きな力になります。🌱
          </p>
        </div>

        <section
          aria-labelledby="donate-heading"
          className="mt-10 rounded-2xl border border-wabi bg-white/70 p-6 md:p-8"
        >
          <h2
            id="donate-heading"
            className="text-base font-semibold text-ink md:text-lg"
          >
            サポートする金額を選んでください
          </h2>
          <div className="mt-5">
            <DonateForm />
          </div>
        </section>

        <section className="mt-10 space-y-2 text-xs text-sumi/70">
          <p>
            <strong className="text-sumi">運営</strong>: V-Corp (個人事業主・屋号)
          </p>
          <p>
            <strong className="text-sumi">代表</strong>: 遠藤 新大
          </p>
          <p>
            <strong className="text-sumi">問い合わせ</strong>:{" "}
            <a
              href="mailto:arata@v-corp.inc"
              className="text-sage hover:underline"
            >
              arata@v-corp.inc
            </a>
          </p>
          <p className="pt-2">
            <Link href="/legal/tokutei" className="text-sage hover:underline">
              特定商取引法に基づく表記
            </Link>
            {" / "}
            <Link href="/legal/privacy" className="text-sage hover:underline">
              プライバシーポリシー
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
