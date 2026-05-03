export default function Home() {
  return (
    <main className="min-h-screen px-6 py-20 sm:px-12 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <header className="mb-24">
          <p className="text-xs tracking-[0.3em] text-neutral-500 uppercase">
            Virtual Corporation
          </p>
          <h1 className="mt-3 text-6xl sm:text-7xl font-semibold tracking-tight">
            V-Corp
          </h1>
          <p className="mt-10 text-xl sm:text-2xl text-neutral-200 leading-[1.7]">
            ひとり と AI で動く、
            <br />
            小さな仮想企業。
          </p>
        </header>

        <Section label="Why">
          <p>
            法人化せず、組織を持たず、それでも事業をする。
            <br />
            AI を全力で味方にすれば、ひとりで動いた方が速い。
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
          <ProductCard
            name="ひとつ"
            tagline="今日やる 1 つだけ、AI が決めてくれる。"
            description="留年・不登校・通信制・発達特性で『何から手を付けるか』が固まる人のための、AI 学習伴走 SaaS。"
            url="v-corp.fun"
            status="Coming Soon"
          />
        </Section>

        <Section label="Approach">
          <ol className="space-y-4">
            <ApproachItem n="01" text="完全非同期。電話・対面はしない。" />
            <ApproachItem n="02" text="月額サブスクのみ。一発受託は受けない。" />
            <ApproachItem n="03" text="当事者の困りごとから始める。" />
            <ApproachItem n="04" text="1 日 3 時間まで。バーンアウトしない。" />
          </ol>
        </Section>

        <footer className="pt-12 mt-20 border-t border-neutral-900">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-neutral-500">
            <span>© 2026 V-Corp</span>
            <a
              href="https://github.com/MrRG32/virtual-corporation"
              className="hover:text-neutral-200 transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <span className="text-neutral-700">·</span>
            <span className="text-neutral-600">
              Built solo with AI, in public.
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-20">
      <h2 className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-6">
        {label}
      </h2>
      <div className="text-neutral-300 leading-[1.9]">{children}</div>
    </section>
  );
}

function ProductCard({
  name,
  tagline,
  description,
  url,
  status,
}: {
  name: string;
  tagline: string;
  description: string;
  url: string;
  status: string;
}) {
  return (
    <div className="border border-neutral-800 rounded-xl p-7 hover:border-neutral-600 transition-colors">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-3xl font-semibold tracking-tight">{name}</h3>
        <span className="text-[11px] tracking-widest text-neutral-500 uppercase whitespace-nowrap">
          {status}
        </span>
      </div>
      <p className="mt-3 text-lg text-neutral-200">{tagline}</p>
      <p className="mt-3 text-sm text-neutral-400 leading-[1.8]">
        {description}
      </p>
      <p className="mt-6 text-sm text-neutral-500">
        <span className="text-neutral-700 mr-2">→</span>
        {url}
      </p>
    </div>
  );
}

function ApproachItem({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-5">
      <span className="text-neutral-600 tabular-nums text-sm pt-[3px]">
        {n}
      </span>
      <span>{text}</span>
    </li>
  );
}
