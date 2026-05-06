import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/LoginForm";
import { WaitlistForm } from "@/components/WaitlistForm";
import { isInviteRequired } from "@/lib/invite";

export const metadata = {
  title: "はじめる / ログイン — よりそい",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  // 既ログイン済みなら適切なページへ (Supabase 不通でも login 画面は表示)
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      redirect(profile ? "/feed" : "/onboarding");
    }
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[login] Supabase error:", err);
  }

  const inviteRequired = isInviteRequired();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <a href="/" className="text-sm text-sumi/60 hover:text-sage">
        ← よりそい
      </a>

      {inviteRequired && (
        <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-sage/40 bg-sage/5 px-3 py-1 text-xs tracking-wider text-sage">
          🌱 α 版 (招待制)
        </p>
      )}

      <h1 className="mt-6 font-display text-4xl text-ink">
        はじめる / ログイン
      </h1>

      {inviteRequired ? (
        <p className="mt-3 text-sm leading-relaxed text-sumi">
          現在は α 版のため、新規登録には<strong>招待コード</strong>が必要です。
          <br />
          既にアカウントをお持ちの方は、メールアドレスのみで通常通りログインできます。
        </p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-sumi">
          メールアドレスを入力すると、リンクを送ります。
          <br />
          <strong>はじめての方</strong>はリンクをタップで自動で
          アカウント作成、<strong>既にアカウントがある方</strong>は
          そのままログインできます。
        </p>
      )}

      <p className="mt-3 rounded-xl bg-sage/5 px-4 py-2 text-xs leading-relaxed text-sumi/80">
        パスワードはありません。毎回メールでログインリンクをお送りする方式です。
        覚える必要が無く、ハッキングされにくい仕組みです。
      </p>

      {params.error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-sakura/10 px-4 py-3 text-sm text-sumi"
        >
          {decodeURIComponent(params.error)}
        </p>
      )}

      <Suspense
        fallback={<div className="mt-12 text-sm text-sumi/60">読み込み中…</div>}
      >
        <LoginForm inviteRequired={inviteRequired} />
      </Suspense>

      {inviteRequired && (
        <section
          aria-labelledby="waitlist-heading"
          className="mt-16 rounded-2xl border border-wabi bg-white/60 p-5"
        >
          <h2
            id="waitlist-heading"
            className="text-sm font-semibold text-ink"
          >
            招待コードをお持ちでない方
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-sumi/80">
            ウェイトリストに登録すると、順番が来た方からメールでご招待します。
          </p>
          <div className="mt-4">
            <WaitlistForm />
          </div>
        </section>
      )}

      <p className="mt-12 text-center text-xs leading-relaxed text-sumi/60">
        続行することで、
        <a href="/legal/terms" className="text-sage underline">
          利用規約
        </a>
        と
        <a href="/legal/privacy" className="text-sage underline">
          プライバシーポリシー
        </a>
        に同意したものとみなします。
      </p>
    </main>
  );
}
