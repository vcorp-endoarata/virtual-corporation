import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "アカウント停止中 — よりそい",
  robots: { index: false, follow: false },
};

export default async function BannedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("ban_until")
    .eq("id", user.id)
    .maybeSingle();

  // BAN されてないなら /feed へ
  if (!profile?.ban_until || new Date(profile.ban_until).getTime() <= Date.now()) {
    redirect("/feed");
  }

  const isPermanent =
    profile.ban_until === "infinity" ||
    new Date(profile.ban_until).getFullYear() > 9000;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-display text-3xl text-ink">
        アカウント停止中
      </h1>

      <p className="mt-6 text-sm leading-relaxed text-sumi">
        よりそい のコミュニティガイドラインに違反する行為が確認されたため、
        現在アカウントを一時停止しております。
      </p>

      {!isPermanent && (
        <p className="mt-4 text-sm text-sumi">
          停止期限: {new Date(profile.ban_until).toLocaleString("ja-JP")}
        </p>
      )}

      <p className="mt-6 text-sm leading-relaxed text-sumi">
        異議申し立てがある場合は、
        <a
          href="mailto:arata@v-corp.inc"
          className="text-sage underline"
        >
          arata@v-corp.inc
        </a>
        までご連絡ください。
      </p>

      <form action="/auth/sign-out" method="POST" className="mt-12">
        <button
          type="submit"
          className="rounded-2xl border border-wabi bg-white px-6 py-2.5 text-sm text-sumi hover:bg-sage/5"
        >
          ログアウト
        </button>
      </form>
    </main>
  );
}
