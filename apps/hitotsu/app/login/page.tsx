import type { Metadata } from "next";
import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { WaitlistForm } from "@/components/waitlist-form";
import { INVITE_REQUIRED } from "@/lib/invite";
import { signInWithEmail } from "./actions";

export const metadata: Metadata = {
  title: "ログイン — ひとつ",
  description: "ひとつにログイン / 新規登録。",
};

type SearchParams = Promise<{
  error?: string;
  sent?: string;
  email?: string;
  next?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sent = sp.sent === "1";
  const error = sp.error;
  const email = sp.email;

  return (
    <main className="min-h-screen px-6 py-20 sm:px-12 sm:py-28">
      <div className="mx-auto max-w-md">
        <header className="mb-12">
          <Link
            href="/"
            className="text-xs tracking-[0.3em] text-sakura-300 uppercase hover:text-sage-700 transition-colors"
          >
            ← ひとつ
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            ログイン / 新規登録
          </h1>
          <p className="mt-3 text-sm text-sage-500 leading-[1.8]">
            {INVITE_REQUIRED ? (
              <>
                現在、<strong>β版・招待制</strong>で運営中です。
                <br />
                招待コードをお持ちの方はログインできます。
              </>
            ) : (
              <>
                メールアドレスを入力すると、リンクが届きます。
                <br />
                初めての方は自動で登録されます。
              </>
            )}
          </p>
        </header>

        {sent ? (
          <div className="border border-cream-300 rounded-xl p-7">
            <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
              メール送信完了
            </p>
            <p className="text-sage-800 leading-[1.8]">
              <span className="text-sage-500">{email}</span> にログイン用のリンクを送りました。
              <br />
              メールを開いて、リンクをタップしてください。
            </p>
            <p className="mt-5 text-xs text-sage-400">
              届かない場合は迷惑メールフォルダも確認してください。
              リンクの有効期限は 1 時間です。
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="text-sm text-sage-500 hover:text-sage-800 transition-colors underline"
              >
                別のメアドで送り直す
              </Link>
            </div>
          </div>
        ) : (
          <>
            <form action={signInWithEmail} className="space-y-5">
              {INVITE_REQUIRED && (
                <div>
                  <label
                    htmlFor="invite_code"
                    className="block text-xs tracking-[0.2em] text-sakura-300 uppercase mb-2"
                  >
                    招待コード
                  </label>
                  <input
                    id="invite_code"
                    name="invite_code"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="hitotsu-xxxxxxxx"
                    pattern="hitotsu-[a-z0-9]{8}"
                    className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-lg text-sage-900 placeholder-sage-300 focus:outline-none focus:border-sage-500 transition-colors font-mono"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs tracking-[0.2em] text-sakura-300 uppercase mb-2"
                >
                  メールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-lg text-sage-900 placeholder-sage-300 focus:outline-none focus:border-sage-500 transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">
                  エラー: {decodeErrorMessage(error)}
                </p>
              )}

              <SubmitButton
                pendingText="送信中..."
                className="w-full py-3 bg-sage-700 text-cream-50 rounded-lg font-medium hover:bg-sage-800"
              >
                ログインリンクを送る
              </SubmitButton>

              <p className="text-xs text-sage-400 leading-[1.8] pt-2">
                続行することで、
                <a
                  href="https://v-corp.inc/legal/terms"
                  className="underline hover:text-sage-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  利用規約
                </a>
                {" / "}
                <a
                  href="https://v-corp.inc/legal/privacy"
                  className="underline hover:text-sage-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  プライバシーポリシー
                </a>
                に同意したものとみなします。
              </p>
            </form>

            {INVITE_REQUIRED && (
              <section className="mt-12 pt-10 border-t border-cream-200">
                <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
                  招待コードをお持ちでない方
                </p>
                <p className="text-sm text-sage-700 leading-[1.9] mb-5">
                  ウェイトリストに登録すると、招待が届き次第ご連絡します。
                  <br />
                  順次招待を送っています。
                </p>
                <WaitlistForm source="login" />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function decodeErrorMessage(error: string): string {
  if (error === "invalid_email") return "メールアドレスの形式が正しくありません。";
  if (error === "invite_code_required") return "招待コードを入力してください。";
  if (error === "invite_code_invalid") return "招待コードが無効です。すでに使用済か、期限切れの可能性があります。";
  return decodeURIComponent(error);
}
