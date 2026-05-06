import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/PostCard";
import { ReplyComposer } from "@/components/ReplyComposer";
import { PostRepliesRealtime } from "@/components/PostRepliesRealtime";

export const metadata = {
  title: "投稿 — よりそい",
  robots: { index: false, follow: false },
};

export default async function PostDetailPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/onboarding");

  const { data: post } = await supabase
    .from("posts")
    .select(
      `
      id, body, category, space, empathy_count, reply_count, status, created_at,
      author:profiles!posts_author_id_fkey(id, nickname, role, show_role, avatar_url),
      media:post_media(id, kind, storage_path, width, height)
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  const postAny = post as never as {
    status: string;
    author: { id: string };
  };
  if (postAny.status !== "published" && postAny.author.id !== user.id) {
    notFound();
  }

  const [{ data: myEmpathy }, { data: myBookmark }, { data: pinInfo }] =
    await Promise.all([
      supabase
        .from("empathy")
        .select("post_id")
        .eq("user_id", user.id)
        .eq("post_id", id)
        .maybeSingle(),
      supabase
        .from("bookmarks")
        .select("post_id")
        .eq("user_id", user.id)
        .eq("post_id", id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("pinned_post_id")
        .eq("id", user.id)
        .maybeSingle(),
    ]);
  const isPinned = pinInfo?.pinned_post_id === id;
  const isOwnPost = postAny.author.id === user.id;

  const { data: replies } = await supabase
    .from("replies")
    .select(
      `
      id, body, status, created_at, author_id,
      author:profiles!replies_author_id_fkey(id, nickname, role, show_role),
      media:post_media!post_media_reply_id_fkey(id, kind, storage_path, width, height)
    `,
    )
    .eq("post_id", id)
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <div className="space-y-6">
      <Link
        href="/feed"
        className="inline-flex items-center text-sm text-sumi hover:text-sage"
      >
        ← フィードに戻る
      </Link>

      <PostCard
        post={post as never}
        hasEmpathy={!!myEmpathy}
        hasBookmark={!!myBookmark}
        isOwn={isOwnPost}
        isPinned={isPinned}
        showPinControl={isOwnPost}
        isAdmin={profile.is_admin === true}
        hideReplyLink
      />

      <section
        aria-labelledby="reply-section"
        className="rounded-2xl border border-wabi/60 bg-cream p-5"
      >
        <h2 id="reply-section" className="text-sm font-semibold text-ink">
          返信を書く
        </h2>
        <p className="mt-1 text-xs text-sumi/70">
          静かに、寄り添う気持ちで。否定や評価はしないでください。
        </p>
        <div className="mt-4">
          <ReplyComposer postId={id} />
        </div>
      </section>

      <section aria-labelledby="replies-list" className="space-y-3">
        <h2 id="replies-list" className="text-sm font-semibold text-ink">
          みんなの返信
        </h2>
        <PostRepliesRealtime
          postId={id}
          initialReplies={(replies ?? []) as never}
          currentUserId={user.id}
        />
      </section>
    </div>
  );
}
