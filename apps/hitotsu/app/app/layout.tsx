import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { getSubscription, isActive } from "@/lib/subscription";
import { isAdmin } from "@/lib/admin";
import { SubmitButton } from "@/components/submit-button";
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

  // 未契約 (試用も active もなし) なら /billing へ
  // ただし admin は常に通る
  const subscription = await getSubscription(user.id);
  if (!isActive(subscription, user.email)) {
    redirect("/billing");
  }

  const admin = isAdmin(user.email);
  const trialing = !admin && subscription?.status === "trialing";

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
          <div className="flex items-center gap-3 sm:gap-4 text-sm">
            {admin && (
              <span className="text-xs px-2 py-1 rounded bg-sage-700 text-cream-50 whitespace-nowrap font-medium">
                Admin
              </span>
            )}
            {trialing && (
              <Link
                href="/billing"
                className="text-xs px-2 py-1 rounded bg-sakura-100 text-sage-700 hover:bg-sakura-200 transition-colors whitespace-nowrap"
              >
                試用中
              </Link>
            )}
            <span className="text-sage-400 truncate max-w-[140px] sm:max-w-[200px]">
              {user.email}
            </span>
            <form action={signOut}>
              <SubmitButton
                spinner={false}
                pendingText="ログアウト中..."
                className="text-sage-500 hover:text-sage-900"
              >
                ログアウト
              </SubmitButton>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-6 sm:px-12 py-12">{children}</div>
    </div>
  );
}
