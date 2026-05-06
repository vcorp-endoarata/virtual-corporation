import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { AvatarUploader } from "@/components/AvatarUploader";

export const metadata = {
  title: "プロフィール編集 — よりそい",
  robots: { index: false, follow: false },
};

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, role, prefecture, city, bio, avatar_url")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/onboarding");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">プロフィール編集</h1>

      <section
        aria-labelledby="avatar-heading"
        className="rounded-2xl border border-wabi bg-white/70 p-5"
      >
        <h2 id="avatar-heading" className="text-sm font-semibold text-ink">
          プロフィール画像
        </h2>
        <div className="mt-4">
          <AvatarUploader
            userId={user.id}
            nickname={profile.nickname}
            initialUrl={profile.avatar_url}
          />
        </div>
      </section>

      <section
        aria-labelledby="info-heading"
        className="rounded-2xl border border-wabi bg-white/70 p-5"
      >
        <h2 id="info-heading" className="text-sm font-semibold text-ink">
          基本情報
        </h2>
        <div className="mt-4">
          <ProfileEditForm
            initial={{
              nickname: profile.nickname,
              prefecture: profile.prefecture,
              city: profile.city,
              bio: profile.bio,
            }}
          />
        </div>
      </section>
    </div>
  );
}
