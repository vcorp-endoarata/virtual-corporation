import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, role, is_admin, avatar_url, font_size, theme")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding");

  // 未読通知数 (RLS で本人のみ取得可)
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  // 文字サイズは html の font-size を上書きすることで実現
  // (Tailwind の text-* は rem ベースなのでこれで全画面スケールする)
  const fontSizePx =
    profile.font_size === "small"
      ? 14
      : profile.font_size === "large"
        ? 18
        : 16;

  const themeClass = profile.theme === "dark" ? "theme-dark" : "";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `html { font-size: ${fontSizePx}px; }`,
        }}
      />
      <div className={`min-h-screen ${themeClass}`}>
        <AppHeader
          nickname={profile.nickname}
          role={profile.role}
          avatarUrl={profile.avatar_url}
          isAdmin={profile.is_admin}
          unreadNotifications={unreadCount ?? 0}
        />
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-4 md:pt-8">
          {children}
        </div>
      </div>
    </>
  );
}
