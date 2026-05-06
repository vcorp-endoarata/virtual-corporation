import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/PostCard";
import { RelationMenu } from "@/components/RelationMenu";
import { Avatar } from "@/components/Avatar";

export const metadata = {
  title: "プロフィール — よりそい",
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<string, string> = {
  self: "当事者",
  family: "家族・身近な人",
  supporter: "支援者",
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (id === user.id) {
    redirect("/profile");
  }

  const { data: target } = await supabase
    .from("profiles")
    .select(
      "id, nickname, role, prefecture, city, bio, avatar_url, pinned_post_id, created_at, show_role, show_prefecture, show_city, show_bio",
    )
    .eq("id", id)
    .maybeSingle();

  if (!target) notFound();

  const showRole = target.show_role !== false;
  const showPrefecture = target.show_prefecture !== false && target.prefecture;
  const showCity = target.show_city !== false && target.city;
  const showBio = target.show_bio !== false && target.bio;

  const [{ data: myEmpathy }, { data: myBookmarks }] = await Promise.all([
    supabase.from("empathy").select("post_id").eq("user_id", user.id),
    supabase.from("bookmarks").select("post_id").eq("user_id", user.id),
  ]);
  const empathySet = new Set((myEmpathy ?? []).map((e) => e.post_id));
  const bookmarkSet = new Set((myBookmarks ?? []).map((b) => b.post_id));

  const { data: relations } = await supabase
    .from("user_relations")
    .select("kind")
    .eq("user_id", user.id)
    .eq("target_id", id);
  const blocked = (relations ?? []).some((r) => r.kind === "block");
  const muted = (relations ?? []).some((r) => r.kind === "mute");

  type PinPost = { id: string };
  let pinnedPost: PinPost | null = null;
  if (target.pinned_post_id) {
    const { data: pin } = await supabase
      .from("posts")
      .select(
        `
        id, body, category, space, empathy_count, reply_count, created_at, status,
        author:profiles!posts_author_id_fkey(id, nickname, role, show_role, avatar_url),
        media:post_media(id, kind, storage_path, width, height)
      `,
      )
      .eq("id", target.pinned_post_id)
      .eq("status", "published")
      .maybeSingle();
    pinnedPost = pin as PinPost | null;
  }

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      id, body, category, space, empathy_count, reply_count, created_at,
      author:profiles!posts_author_id_fkey(id, nickname, role, show_role, avatar_url),
      media:post_media(id, kind, storage_path, width, height)
    `,
    )
    .eq("author_id", id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(30);

  const otherPosts = (posts ?? []).filter(
    (p) => (p as { id: string }).id !== target.pinned_post_id,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/feed"
        className="inline-flex items-center text-sm text-sumi hover:text-sage"
      >
        ← フィードに戻る
      </Link>

      <header className="rounded-2xl border border-wabi bg-white/70 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar
              url={target.avatar_url}
              nickname={target.nickname}
              size="lg"
            />
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl text-ink">
                {target.nickname}
              </h1>
              {showRole && (
                <span className="rounded-full bg-sage/10 px-3 py-1 text-xs text-sage">
                  {ROLE_LABEL[target.role] ?? target.role}
                </span>
              )}
              {blocked && (
                <span className="rounded-full bg-sumi/10 px-3 py-1 text-xs text-sumi">
                  ブロック中
                </span>
              )}
              {muted && (
                <span className="rounded-full bg-sumi/10 px-3 py-1 text-xs text-sumi">
                  ミュート中
                </span>
              )}
            </div>
          </div>
          <RelationMenu
            targetUserId={target.id}
            initialBlocked={blocked}
            initialMuted={muted}
          />
        </div>

        {(showPrefecture || showCity) && (
          <p className="mt-3 text-sm text-sumi">
            📍{" "}
            {[
              showPrefecture ? target.prefecture : null,
              showCity ? target.city : null,
            ]
              .filter(Boolean)
              .join(" ")}
          </p>
        )}

        {showBio && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-sumi">
            {target.bio}
          </p>
        )}

        <p className="mt-4 text-xs text-sumi/60">
          {new Date(target.created_at).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
          })}
          から、よりそっています
        </p>
      </header>

      {pinnedPost ? (
        <section aria-label="ピン留めされた投稿">
          <PostCard
            post={pinnedPost as never}
            hasEmpathy={empathySet.has(pinnedPost.id)}
            hasBookmark={bookmarkSet.has(pinnedPost.id)}
            isOwn={false}
            pinnedBadge
          />
        </section>
      ) : null}

      <section aria-labelledby="posts-heading" className="space-y-4">
        <h2 id="posts-heading" className="text-sm font-semibold text-ink">
          投稿 ({posts?.length ?? 0})
        </h2>
        {otherPosts.length > 0 ? (
          otherPosts.map((p) => (
            <PostCard
              key={(p as { id: string }).id}
              post={p as never}
              hasEmpathy={empathySet.has((p as { id: string }).id)}
              hasBookmark={bookmarkSet.has((p as { id: string }).id)}
              isOwn={false}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-wabi p-8 text-center text-sm text-sumi/60">
            まだ表示できる投稿はありません。
          </div>
        )}
      </section>
    </div>
  );
}
