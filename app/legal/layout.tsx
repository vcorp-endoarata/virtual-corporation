import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen px-6 py-16 sm:px-12 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12">
          <Link
            href="/"
            className="text-xs tracking-[0.3em] text-neutral-500 uppercase hover:text-neutral-300 transition-colors"
          >
            ← V-Corp
          </Link>
        </header>
        <article className="prose-legal text-neutral-300 leading-[1.9]">
          {children}
        </article>
        <footer className="pt-12 mt-20 border-t border-neutral-900 text-sm text-neutral-500">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/legal/terms" className="hover:text-neutral-200 transition-colors">
              利用規約
            </Link>
            <Link href="/legal/privacy" className="hover:text-neutral-200 transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/legal/tokushoho" className="hover:text-neutral-200 transition-colors">
              特定商取引法に基づく表記
            </Link>
            <span className="text-neutral-700">·</span>
            <span>© 2026 V-Corp</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
