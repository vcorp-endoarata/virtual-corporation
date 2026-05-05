export const revalidate = 3600;

const LAUNCH_DATE = "2026-06-01T00:00:00+09:00";

function daysUntilLaunch(): number {
  const launch = new Date(LAUNCH_DATE).getTime();
  const now = Date.now();
  const ms = launch - now;
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function Home() {
  const days = daysUntilLaunch();

  return (
    <main className="min-h-screen px-6 py-20 sm:px-12 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <header className="mb-24">
          <p className="text-xs tracking-[0.3em] text-sage-400 uppercase">
            Virtual Corporation
          </p>
          <h1 className="mt-3 text-6xl sm:text-7xl font-semibold tracking-tight">
            V-Corp
          </h1>
          <p className="mt-10 text-xl sm:text-2xl text-sage-800 leading-[1.7]">
            ひとり と AI で動く、
            <br />
            小さな仮想企業。
          </p>

          {days > 0 ? (
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-cream-100 border border-cream-300 text-sm">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full bg-sakura-300 animate-pulse"
              />
              <span className="text-sage-700">
                6/1 ひとつ + よりそい 同時公開 — 残り{" "}
                <strong className="text-sage-900 tabular-nums">{days}</strong> 日
              </span>
            </div>
          ) : (
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-sage-100 border border-sage-300 text-sm">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full bg-sage-700"
              />
              <span className="text-sage-900 font-medium">
                ひとつ + よりそい 公開中
              </span>
            </div>
          )}
        </header>

        <Section label="Why">
          <p>
            法人化せず、組織を持たず、それでも事業をする。
            <br />
            AI を全力で味方にすれば、ひとりで動いた方が速い。
          </p>
          <p className="mt-5">
            ひとりが、AI を同僚として「企業」のように動く。
            <br />
            それが V-Corp が言う「仮想企業」。
          </p>
          <p className="mt-5">
            代表者は 19 歳。AI が趣味。
            <br />
            ADHD とトゥレット症候群、留年 3 年の経験を持つ。
          </p>
          <p className="mt-5">
            できない理由を数えるのではなく、
            <br />
            できる形で組み立て直す。
          </p>
        </Section>

        <Section label="Products">
          <div className="space-y-5">
            <ProductCard
              name="よりそい"
              tagline="ひとり言を、誰かが受け止めてくれる場所。"
              description="希死念慮・絶望・孤独を抱える当事者のための、匿名で『うなずき合える』コミュニティ SNS。月額 ¥300。"
              url="yorisoi.community"
              href="https://yorisoi.community"
              status={days > 0 ? `Launching 6/1` : "Live"}
            />
            <ProductCard
              name="ひとつ"
              tagline="今日やる 1 つだけ、AI が決めてくれる。"
              description="留年・不登校・通信制・発達特性で『何から手を付けるか』が固まる人のための、AI 学習伴走 SaaS。月額 ¥1,480 (7 日間無料試用)。"
              url="hitotsu.v-corp.inc"
              href="https://hitotsu.v-corp.inc"
              status={days > 0 ? `Launching 6/1` : "Live"}
            />
          </div>
        </Section>

        <Section label="Approach">
          <ol className="space-y-4">
            <ApproachItem n="01" text="完全非同期。電話・対面はしない。" />
            <ApproachItem n="02" text="月額サブスクのみ。一発受託は受けない。" />
            <ApproachItem n="03" text="当事者の困りごとから始める。" />
            <ApproachItem n="04" text="1 日 3 時間まで。バーンアウトしない。" />
          </ol>
        </Section>

        <footer className="pt-12 mt-20 border-t border-cream-200 space-y-4 text-sm text-sage-400">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="/legal/terms" className="hover:text-sage-800 transition-colors">利用規約</a>
            <a href="/legal/privacy" className="hover:text-sage-800 transition-colors">プライバシーポリシー</a>
            <a href="/legal/tokushoho" className="hover:text-sage-800 transition-colors">特定商取引法に基づく表記</a>
            <a href="mailto:arata@v-corp.inc" className="hover:text-sage-800 transition-colors">arata@v-corp.inc</a>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>© 2026 V-Corp</span>
            <a href="https://github.com/MrRG32/virtual-corporation" className="hover:text-sage-800 transition-colors" target="_blank" rel="noreferrer">GitHub</a>
            <span className="text-cream-300">·</span>
            <span className="text-sage-300">Built solo with AI, in public.</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-20">
      <h2 className="text-xs tracking-[0.3em] text-sage-400 uppercase mb-6">{label}</h2>
      <div className="text-sage-700 leading-[1.9]">{children}</div>
    </section>
  );
}

function ProductCard({ name, tagline, description, url, href, status }: { name: string; tagline: string; description: string; url: string; href?: string; status: string }) {
  const cardInner = (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-3xl font-semibold tracking-tight">{name}</h3>
        <span className="text-[11px] tracking-widest text-sage-400 uppercase whitespace-nowrap">{status}</span>
      </div>
      <p className="mt-3 text-lg text-sage-800">{tagline}</p>
      <p className="mt-3 text-sm text-sage-500 leading-[1.8]">{description}</p>
      <p className="mt-6 flex items-center gap-2 text-sm text-sage-500 group-hover:text-sage-900 transition-colors">
        <span>{url}</span>
        <span aria-hidden className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
      </p>
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="group block border border-cream-300 rounded-xl p-7 bg-cream-50 hover:bg-sage-100 hover:border-sage-400 hover:shadow-sm transition-all cursor-pointer">
        {cardInner}
      </a>
    );
  }
  return <div className="border border-cream-300 rounded-xl p-7">{cardInner}</div>;
}

function ApproachItem({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-5">
      <span className="text-sage-300 tabular-nums text-sm pt-[3px]">{n}</span>
      <span>{text}</span>
    </li>
  );
}
