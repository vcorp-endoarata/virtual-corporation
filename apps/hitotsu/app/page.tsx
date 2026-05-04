export default function Home() {
  return (
    <main className="min-h-screen px-6 py-20 sm:px-12 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <header className="mb-20">
          <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase">
            by V-Corp
          </p>
          <h1 className="mt-3 text-6xl sm:text-7xl font-semibold tracking-tight">
            ひとつ
          </h1>
          <div
            aria-hidden="true"
            className="mt-5 h-[2px] w-12 bg-sakura-200"
          />
          <p className="mt-10 text-xl sm:text-2xl text-sage-800 leading-[1.7]">
            今日やる 1 つだけ、
            <br />
            AI が決めてくれる。
          </p>
        </header>

        <Section label="Who">
          <p>
            「やらなきゃいけないこと」が積み重なりすぎて、
            <br />
            何から手を付けていいか分からなくなる人へ。
          </p>
          <p className="mt-5">
            留年・不登校・通信制で、
            <br />
            自分のペースで進みたい人。
          </p>
          <p className="mt-5">
            ADHD・発達特性で、
            <br />
            既存のスタディサプリ等が合わなかった人。
          </p>
        </Section>

        <Section label="How">
          <ol className="space-y-4">
            <Step n="01" text="自分の現状・目標・1日に使える時間を入力する。" />
            <Step
              n="02"
              text="毎朝、AI が『今日やる 1 つだけ』を決めて表示する。"
            />
            <Step
              n="03"
              text="完了したらチェック。翌日のタスクが再計算される。"
            />
            <Step
              n="04"
              text="重い日は AI が 5 分タスクに更に分解してくれる。"
            />
          </ol>
        </Section>

        <Section label="Status">
          <div className="border border-cream-300 rounded-xl p-7">
            <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
              Early Preview
            </p>
            <p className="text-lg text-sage-800">
              開発中。アカウント登録だけ先行公開しています。
            </p>
            <p className="mt-4 text-sm text-sage-500">
              開発記録は{" "}
              <a
                href="https://v-corp.inc"
                className="underline hover:text-sage-900 transition-colors"
              >
                V-Corp
              </a>{" "}
              にて公開しています。
            </p>
            <a
              href="/login"
              className="mt-6 inline-block px-5 py-2.5 bg-sage-700 text-cream-50 rounded-lg text-sm font-medium hover:bg-sage-800 transition-colors"
            >
              ログイン / 登録 →
            </a>
          </div>
        </Section>

        <footer className="pt-12 mt-20 border-t border-cream-200">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-sage-400">
            <a
              href="https://v-corp.inc"
              className="hover:text-sage-800 transition-colors"
            >
              V-Corp
            </a>
            <a
              href="https://v-corp.inc/legal/terms"
              className="hover:text-sage-800 transition-colors"
            >
              利用規約
            </a>
            <a
              href="https://v-corp.inc/legal/privacy"
              className="hover:text-sage-800 transition-colors"
            >
              プライバシー
            </a>
            <a
              href="https://v-corp.inc/legal/tokushoho"
              className="hover:text-sage-800 transition-colors"
            >
              特定商取引法表記
            </a>
            <span className="text-cream-300">·</span>
            <span>© 2026 V-Corp</span>
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
      <h2 className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-6">
        {label}
      </h2>
      <div className="text-sage-700 leading-[1.9]">{children}</div>
    </section>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-5">
      <span className="text-sakura-300 tabular-nums text-sm pt-[3px]">
        {n}
      </span>
      <span>{text}</span>
    </li>
  );
}
