import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/PostCard";
import { SearchForm } from "@/components/SearchForm";

export const metadata = {
  title: "検索 — よりそい",
  robots: { index: false, follow: false },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const escaped = q.replace(/([%_\\])/g, "\\$1");

  const [{ data: myEmpathy }, { data: myBookmarks }, { data: profile }] =
    await Promise.all([
      supabase.from("empathy").select("post_id").eq("user_id", user.id),
      supabase.from("bookmarks").select("post_id").eq("user_id", user.id),
      supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle(),
    ]);
  const empathySet = new Set((myEmpathy ?? []).map((e) => e.post_id));
  const bookmarkSet = new Set((myBookmarks ?? []).map((b) => b.post_id));
  const isAdmin = profile?.is_admin === true;

  const { data: posts } = q
    ? await supabase
        .from("posts")
        .select(
          `
          id, body, category, space, empathy_count, reply_count, created_at,
          author:profiles!posts_author_id_fkey(id, nickname, role, show_role, avatar_url),
          media:post_media(id, kind, storage_path, width, height)
        `,
        )
        .eq("status", "published")
        .ilike("body", `%${escaped}%`)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: null };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">検索</h1>

      <SearchForm initialQuery={q} />

      {q && (
        <div className="text-xs text-sumi/60">
          「<strong className="text-ink">{q}</strong>」の検索結果:{" "}
          {posts?.length ?? 0} 件
        </div>
      )}

      {posts && posts.length > 0 ? (
        <section className="space-y-4">
          {posts.map((p) => {
            const author = (p as unknown as { author?: { id: string } }).author;
            return (
              <PostCard
                key={p.id}
                post={p as never}
                hasEmpathy={empathySet.has(p.id)}
                hasBookmark={bookmarkSet.has(p.id)}
                isOwn={author?.id === user.id}
                isAdmin={isAdmin}
              />
            );
          })}
        </section>
      ) : q ? (
        <div className="rounded-2xl border border-dashed border-wabi p-10 text-center text-sm text-sumi/70">
          「{q}」に一致する投稿はありませんでした。
          <br />
          別のキーワードでお試しください。
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-wabi p-10 text-center text-sm text-sumi/70">
          キーワードを入力して検索してください。
          <br />
          投稿の本文から探します (アクセス権のあるスペースのみ)。
        </div>
      )}
    </div>
  );
}
