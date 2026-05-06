import Link from "next/link";

export const metadata = {
  title: "ありがとうございます — よりそい",
  robots: { index: false, follow: false },
};

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string }>;
}) {
  const params = await searchParams;
  const amountNum = params.amount ? Number(params.amount) : null;
  const amountStr =
    amountNum && Number.isFinite(amountNum)
      ? `¥${amountNum.toLocaleString()}`
      : null;

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-5xl" aria-hidden>
          🌱
        </p>
        <h1 className="mt-6 font-display text-3xl text-ink md:text-4xl">
          ありがとうございます
        </h1>
        <p className="mt-6 text-base leading-relaxed text-sumi">
          {amountStr ? (
            <>
              <strong className="text-ink">{amountStr}</strong>{" "}
              のご支援、心から感謝いたします。
            </>
          ) : (
            <>ご支援、心から感謝いたします。</>
          )}
          <br />
          あなたのサポートが、よりそい のコミュニティを守ってくれます。
        </p>
        <p className="mt-6 text-sm text-sumi/70">
          領収書が必要な方は{" "}
          <a
            href="mailto:arata@v-corp.inc?subject=サポートの領収書希望"
            className="text-sage hover:underline"
          >
            arata@v-corp.inc
          </a>{" "}
          までご連絡ください。
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link
            href="/feed"
            className="rounded-full bg-sage px-5 py-2 text-sm font-semibold text-cream hover:opacity-90"
          >
            フィードを見る
          </Link>
          <Link
            href="/"
            className="rounded-full border border-wabi bg-white/70 px-5 py-2 text-sm text-sumi hover:bg-sage/5"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
