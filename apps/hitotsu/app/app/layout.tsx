import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { signOut } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // オンボーディング未完了ならまずそこへ
  const profile = await getProfile(user.id);
  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-cream-200">
        <div className="mx-auto max-w-2xl px-6 sm:px-12 py-5 flex items-center justify-between gap-4">
          <Link
            href="/app"
            className="text-xs tracking-[0.3em] text-sakura-300 uppercase hover:text-sage-900 transition-colors"
          >
            ひとつ
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-sage-400 truncate max-w-[200px]">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sage-500 hover:text-sage-900 transition-colors"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-6 sm:px-12 py-12">{children}</div>
    </div>
  );
}
