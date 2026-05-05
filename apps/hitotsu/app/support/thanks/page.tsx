import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ありがとうございます — ひとつ",
  description: "ご支援ありがとうございます。",
};

type SearchParams = Promise<{ amount?: string }>;

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const parsed = sp.amount ? Number(sp.amount) : NaN;
  const amount =
    Number.isFinite(parsed) && Number.isInteger(parsed) && parsed > 0
      ? parsed
      : null;

  return (
    <main className="min-h-screen px-6 py-20 sm:px-12 sm:py-28">
      <div className="mx-auto max-w-md">
        <header className="mb-10">
          <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase">
            ひとつ
          </p>
        </header>

        <section className="border border-sage-300 rounded-xl p-7 bg-sage-100 mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-sage-900 mb-4">
            ありがとうございます
          </h1>
          {amount ? (
            <p className="text-sage-800 leading-[1.9]">
              <strong className="text-2xl text-sage-900">
                ¥{amount.toLocaleString()}
              </strong>{" "}
              のご支援、心から感謝いたします。
              <br />
              あなたのサポートが、ひとつ の運営を支えてくれます。
            </p>
          ) : (
            <p className="text-sage-800 leading-[1.9]">
              ご支援、心から感謝いたします。
              <br />
              あなたのサポートが、ひとつ の運営を支えてくれます。
            </p>
          )}
          <p className="mt-5 text-xs text-sage-500 leading-[1.8]">
            領収書が必要な方は{" "}
            <a
              href="mailto:info@v-corp.inc"
              className="underline hover:text-sage-700"
            >
              info@v-corp.inc
            </a>
            {" "}までご連絡ください。
          </p>
        </section>

        <div className="space-y-3">
          <Link
            href="/app"
            className="block w-full text-center py-3 bg-sage-700 text-cream-50 rounded-lg font-medium hover:bg-sage-800 transition-colors"
          >
            ダッシュボードへ
          </Link>
          <Link
            href="/"
            className="block w-full text-center py-3 border border-sage-300 text-sage-700 rounded-lg font-medium hover:bg-cream-100 transition-colors"
          >
            ひとつ ホームへ
          </Link>
        </div>
      </div>
    </main>
  );
}
