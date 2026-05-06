import Link from "next/link";
import { PostCard } from "@/components/PostCard";

type Post = {
  id: string;
  [key: string]: unknown;
};

export function ListeningSection({
  posts,
  empathySet,
  bookmarkSet,
  preview = false,
}: {
  posts: Post[];
  empathySet: Set<string>;
  bookmarkSet: Set<string>;
  /** true: フィード末尾に最大 3 件 + 「もっと見る」/ false: 全件表示 */
  preview?: boolean;
}) {
  if (posts.length === 0) return null;

  const displayPosts = preview ? posts.slice(0, 3) : posts;

  return (
    <section
      aria-labelledby="listening-heading"
      className={
        preview
          ? "mt-8 rounded-2xl border border-sage/30 bg-sage/5 p-5"
          : "space-y-4"
      }
    >
      {preview && (
        <>
          <h2
            id="listening-heading"
            className="text-base font-semibold text-ink"
          >
            🌱 あなたの声を、必要としている人がいます
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-sumi/80">
            まだ返信がついていない、悩み・質問の投稿です。
            <br />
            ひとことが、誰かの孤独を救うかもしれません。
          </p>
        </>
      )}
      <div className={preview ? "mt-4 space-y-3" : "space-y-4"}>
        {displayPosts.map((p) => (
          <PostCard
            key={p.id}
            post={p as never}
            hasEmpathy={empathySet.has(p.id)}
            hasBookmark={bookmarkSet.has(p.id)}
            isOwn={false}
          />
        ))}
      </div>
      {preview && posts.length > 3 && (
        <div className="mt-4 text-center">
          <Link
            href="/listening"
            className="text-sm text-sage hover:underline"
          >
            他にも待っている方がいます →
          </Link>
        </div>
      )}
    </section>
  );
}
