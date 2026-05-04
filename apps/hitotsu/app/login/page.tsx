import type { Metadata } from "next";
import Link from "next/link";
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
            className="text-xs tracking-[0.3em] text-neutral-500 uppercase hover:text-neutral-300 transition-colors"
          >
            ← ひとつ
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            ログイン / 新規登録
          </h1>
          <p className="mt-3 text-sm text-neutral-400 leading-[1.8]">
            メールアドレスを入力すると、リンクが届きます。
            <br />
            初めての方は自動で登録されます。
          </p>
        </header>

        {sent ? (
          <div className="border border-neutral-800 rounded-xl p-7">
            <p className="text-xs tracking-[0.3em] text-neutral-500 uppercase mb-3">
              メール送信完了
            </p>
            <p className="text-neutral-200 leading-[1.8]">
              <span className="text-neutral-400">{email}</span> にログイン用のリンクを送りました。
              <br />
              メールを開いて、リンクをタップしてください。
            </p>
            <p className="mt-5 text-xs text-neutral-500">
              届かない場合は迷惑メールフォルダも確認してください。
              リンクの有効期限は 1 時間です。
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors underline"
              >
                別のメアドで送り直す
              </Link>
            </div>
          </div>
        ) : (
          <form action={signInWithEmail} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs tracking-[0.2em] text-neutral-500 uppercase mb-2"
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
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">
                エラー: {decodeErrorMessage(error)}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-neutral-100 text-neutral-900 rounded-lg font-medium hover:bg-white transition-colors"
            >
              ログインリンクを送る
            </button>

            <p className="text-xs text-neutral-500 leading-[1.8] pt-2">
              続行することで、
              <a
                href="https://v-corp.inc/legal/terms"
                className="underline hover:text-neutral-300"
                target="_blank"
                rel="noreferrer"
              >
                利用規約
              </a>
              {" / "}
              <a
                href="https://v-corp.inc/legal/privacy"
                className="underline hover:text-neutral-300"
                target="_blank"
                rel="noreferrer"
              >
                プライバシーポリシー
              </a>
              に同意したものとみなします。
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

function decodeErrorMessage(error: string): string {
  if (error === "invalid_email") return "メールアドレスの形式が正しくありません。";
  return decodeURIComponent(error);
}
