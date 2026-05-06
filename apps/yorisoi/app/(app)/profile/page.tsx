import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";

const ROLE_LABEL: Record<string, string> = {
  self: "当事者",
  family: "家族・身近な人",
  supporter: "支援者",
};

const CATEGORY_LABEL: Record<string, string> = {
  feeling: "🌥 気持ち",
  worry: "💭 悩み",
  experience: "✨ 体験",
  question: "❓ 質問",
  celebration: "🌱 お祝い",
  diary: "📝 日記",
};

const SPACE_LABEL: Record<string, string> = {
  self: "🌱 当事者の場",
  family: "🤲 身近な人の場",
  shared: "🌅 みんなの場",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}日前`;
  return `${Math.floor(day / 30)}ヶ月前`;
}

export const metadata = {
  title: "プロフィール — よりそい",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, role, prefecture, city, bio, avatar_url, created_at")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/onboarding");

  // 自分の投稿 (最新 20件)
  const { data: posts } = await supabase
    .from("posts")
    .select("id, body, category, space, empathy_count, status, created_at")
    .eq("author_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-wabi bg-white/70 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              url={profile.avatar_url}
              nickname={profile.nickname}
              size="lg"
            />
            <h1 className="font-display text-2xl text-ink">{profile.nickname}</h1>
          </div>
          <Link
            href="/profile/edit"
            className="rounded-full border border-wabi px-3 py-1 text-xs text-sumi hover:bg-sage/5"
          >
            編集
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-sage/10 px-2 py-1 text-sage">
            {ROLE_LABEL[profile.role] ?? profile.role}
          </span>
          {profile.prefecture && (
            <span className="rounded-full bg-sumi/10 px-2 py-1 text-sumi">
              📍 {profile.prefecture}
              {profile.city ? ` ${profile.city}` : ""}
            </span>
          )}
        </div>

        {profile.bio && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-sumi">
            {profile.bio}
          </p>
        )}

        <p className="mt-4 text-xs text-sumi/50">
          {new Date(profile.created_at).toLocaleDateString("ja-JP")} から
          よりそい
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-ink">あなたの投稿</h2>
        {posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-wabi bg-white/70 p-4"
              >
                <header className="flex items-center justify-between text-xs text-sumi/70">
                  <div className="flex flex-wrap gap-2">
                    <span>{CATEGORY_LABEL[p.category] ?? p.category}</span>
                    <span>{SPACE_LABEL[p.space] ?? p.space}</span>
                    {p.status === "hidden" && (
                      <span className="rounded-full bg-amber-100 px-2 text-amber-700">
                        非表示中
                      </span>
                    )}
                  </div>
                  <time>{timeAgo(p.created_at)}</time>
                </header>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
                  {p.body}
                </p>
                {p.empathy_count > 0 && (
                  <p className="mt-2 text-xs text-sage">
                    🌿 {p.empathy_count} 人がうなずき
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-wabi p-8 text-center text-sm text-sumi/70">
            まだ投稿していません
          </div>
        )}
      </section>
    </div>
  );
}
