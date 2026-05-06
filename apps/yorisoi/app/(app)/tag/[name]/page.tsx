import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/PostCard";
import { getRelationFilters } from "@/lib/relations";

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { name } = await params;
  const tag = decodeURIComponent(name);
  return {
    title: `#${tag} — よりそい`,
    robots: { index: false, follow: false },
  };
}

type TagRow = {
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

export default async function TagPage({ params }: Props) {
  const { name } = await params;
  const tag = decodeURIComponent(name).toLowerCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("post_tags")
    .select(
      `
      post_id,
      post:posts!post_tags_post_id_fkey(
        id, body, category, space, empathy_count, reply_count, created_at, status,
        author:profiles!posts_author_id_fkey(id, nickname, role, show_role, avatar_url),
        media:post_media(id, kind, storage_path, width, height)
      )
    `,
    )
    .eq("tag", tag)
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = ((rows as unknown as TagRow[]) ?? [])
    .map((r) => r.post)
    .filter(
      (p): p is NonNullable<typeof p> => p !== null && p.status === "published",
    );

  const [
    { data: myEmpathy },
    { data: myBookmarks },
    { hiddenAuthors },
    { data: profile },
  ] = await Promise.all([
    supabase.from("empathy").select("post_id").eq("user_id", user.id),
    supabase.from("bookmarks").select("post_id").eq("user_id", user.id),
    getRelationFilters(user.id),
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle(),
  ]);
  const empathySet = new Set((myEmpathy ?? []).map((e) => e.post_id));
  const bookmarkSet = new Set((myBookmarks ?? []).map((b) => b.post_id));
  const isAdmin = profile?.is_admin === true;

  const filtered = posts.filter((p) => !hiddenAuthors.has(p.author?.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">#{tag}</h1>
        <Link href="/feed" className="text-xs text-sumi hover:text-sage">
          フィードに戻る
        </Link>
      </div>
      <p className="text-xs text-sumi/60">
        「#{tag}」が付いた投稿: {filtered.length} 件
      </p>

      {filtered.length > 0 ? (
        <section className="space-y-4">
          {filtered.map((p) => (
            <PostCard
              key={p.id}
              post={p as never}
              hasEmpathy={empathySet.has(p.id)}
              hasBookmark={bookmarkSet.has(p.id)}
              isOwn={p.author?.id === user.id}
              isAdmin={isAdmin}
            />
          ))}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-wabi p-10 text-center text-sm text-sumi/70">
          このタグの投稿はまだありません。
        </div>
      )}
    </div>
  );
}
