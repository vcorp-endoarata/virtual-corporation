export const revalidate = 3600;

export default function Negura() {
  return (
    <main className="min-h-screen px-6 py-20 sm:px-12 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <header className="mb-24">
          <p className="text-xs tracking-[0.3em] text-sage-400 uppercase">
            V-Corp · Product 03
          </p>
          <h1 className="mt-3 text-6xl sm:text-7xl font-semibold tracking-tight">
            ねぐら
          </h1>
          <p className="mt-10 text-xl sm:text-2xl text-sage-800 leading-[1.7]">
            わかったフリをしない、<br />AI の話し相手。
          </p>
          <div className="mt-10 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-cream-100 border border-cream-300 text-sm">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-sakura-300 animate-pulse" />
            <span className="text-sage-700">構想中 — 2026 夏 公開予定</span>
          </div>
        </header>

        {/* What / Why / Pricing / Updates の Section が続く */}
        {/* Section component は v-corp の page.tsx と同じ */}

      </div>
    </main>
  );
}
