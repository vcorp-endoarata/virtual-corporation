import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { INVITE_REQUIRED } from "@/lib/invite";

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
  const isPostLaunchAlpha = days <= 0 && INVITE_REQUIRED;

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
            {days > 0 ? (
              <>
                <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
                  6/1 正式公開
                </p>
                <p className="text-lg text-sage-800">
                  残り{" "}
                  <strong className="text-sage-900 tabular-nums">{days}</strong>{" "}
                  日。
                </p>
                <p className="mt-3 text-sm text-sage-500 leading-[1.8]">
                  開発過程は X / note で発信中。
                  <br />
                  先行アカウント登録は今すぐご利用いただけます。
                </p>
              </>
            ) : isPostLaunchAlpha ? (
              <>
                <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
                  α版・招待制で開放中
                </p>
                <p className="text-lg text-sage-800 leading-[1.7]">
                  招待コードをお持ちの方はログインできます。
                </p>
                <p className="mt-3 text-sm text-sage-500 leading-[1.8]">
                  招待コードは X で個別配布中、またはウェイトリストから順次お送りしています。
                </p>
              </>
            ) : (
              <>
                <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
                  Now Live
                </p>
                <p className="text-lg text-sage-800">
                  正式公開中。今日のひとつを始めてください。
                </p>
              </>
            )}
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

            {isPostLaunchAlpha ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/login"
                  className="inline-block px-5 py-2.5 bg-sage-700 text-cream-50 rounded-lg text-sm font-medium hover:bg-sage-800 transition-colors"
                >
                  招待コードでログイン →
                </a>
                <a
                  href="#waitlist"
                  className="inline-block px-5 py-2.5 border border-sage-300 text-sage-700 rounded-lg text-sm font-medium hover:bg-cream-100 transition-colors"
                >
                  ウェイトリスト登録
                </a>
              </div>
            ) : (
              <a
                href="/login"
                className="mt-6 inline-block px-5 py-2.5 bg-sage-700 text-cream-50 rounded-lg text-sm font-medium hover:bg-sage-800 transition-colors"
              >
                ログイン / 登録 →
              </a>
            )}
          </div>
        </Section>

        {isPostLaunchAlpha && (
          <Section label="Waitlist">
            <div
              id="waitlist"
              className="border border-cream-300 rounded-xl p-7 bg-cream-50"
            >
              <p className="text-sage-700 leading-[1.9] mb-5">
                招待コードがまだない方は、ウェイトリストにご登録ください。
                <br />
                順次招待コードをお送りしています。
              </p>
              <WaitlistForm source="lp" />
            </div>
          </Section>
        )}

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
            <Link
              href="/support"
              className="hover:text-sage-800 transition-colors"
            >
              サポート
            </Link>
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
