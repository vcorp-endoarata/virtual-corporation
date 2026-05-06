import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/PostCard";

export const metadata = {
  title: "ブックマーク — よりそい",
  robots: { index: false, follow: false },
};

type BookmarkRow = {
  post_id: string;
  post: {
    id: string;
    body: string;
    category: string;
    space: string;
    empathy_count: number;
    reply_count: number;
    created_at: string;
    status: string;
    author: { id: string; nickname: string; role: string; show_role: boolean };
    media: {
      id: string;
      kind: "image" | "video";
      storage_path: string;
      width: number | null;
      height: number | null;
    }[];
  } | null;
};

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("bookmarks")
    .select(
      `
      post_id,
      post:posts!bookmarks_post_id_fkey(
        id, body, category, space, empathy_count, reply_count, created_at, status,
        author:profiles!posts_author_id_fkey(id, nickname, role, show_role, avatar_url),
        media:post_media(id, kind, storage_path, width, height)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const posts = ((rows as unknown as BookmarkRow[]) ?? [])
    .map((r) => r.post)
    .filter(
      (p): p is NonNullable<typeof p> => p !== null && p.status === "published",
    );

  const [{ data: myEmpathy }, { data: profile }] = await Promise.all([
    supabase.from("empathy").select("post_id").eq("user_id", user.id),
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle(),
  ]);
  const empathySet = new Set((myEmpathy ?? []).map((e) => e.post_id));
  const isAdmin = profile?.is_admin === true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">🔖 ブックマーク</h1>
        <Link
          href="/feed"
          className="text-xs text-sumi hover:text-sage"
        >
          フィードに戻る
        </Link>
      </div>

      {posts.length > 0 ? (
        <section className="space-y-4">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p as never}
              hasEmpathy={empathySet.has(p.id)}
              hasBookmark={true}
              isOwn={p.author?.id === user.id}
              isAdmin={isAdmin}
            />
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-wabi p-10 text-center text-sm text-sumi/70">
          まだブックマークはありません。
          <br />
          気になる投稿に 📑 マークを付けて、後でゆっくり読みましょう。
        </div>
      )}
    </div>
  );
}
