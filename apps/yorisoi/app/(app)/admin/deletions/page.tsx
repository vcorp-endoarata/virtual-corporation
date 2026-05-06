import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminDeletionActions } from "@/components/AdminDeletionActions";

export const metadata = {
  title: "削除申請 — よりそい",
  robots: { index: false, follow: false },
};

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DeletionRow = {
  id: string;
  post_id: string;
  requester_id: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};

export default async function AdminDeletionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return (
      <div className="rounded-2xl border border-wabi bg-white/70 p-10 text-center">
        <p className="text-sm text-sumi">このページは運営者専用です。</p>
      </div>
    );
  }

  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("deletion_requests")
    .select("id, post_id, requester_id, status, created_at, reviewed_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(50);

  const { data: recent } = await admin
    .from("deletion_requests")
    .select("id, post_id, requester_id, status, created_at, reviewed_at")
    .neq("status", "pending")
    .order("reviewed_at", { ascending: false })
    .limit(30);

  const allRows = [...(pending ?? []), ...(recent ?? [])] as DeletionRow[];
  const postIds = allRows.map((r) => r.post_id);
  const userIds = allRows.map((r) => r.requester_id);

  const [postsResp, profilesResp] = await Promise.all([
    postIds.length
      ? admin
          .from("posts")
          .select(
            "id, body, category, space, status, reply_count, created_at, author_id",
          )
          .in("id", postIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? admin.from("profiles").select("id, nickname").in("id", userIds)
      : Promise.resolve({ data: [] }),
  ]);

  type PostRow = {
    id: string;
    body: string;
    category: string;
    space: string;
    status: string;
    reply_count: number;
    created_at: string;
    author_id: string;
  };
  const postById = new Map(
    ((postsResp.data ?? []) as PostRow[]).map((p) => [p.id, p]),
  );
  const nicknameById = new Map(
    ((profilesResp.data ?? []) as { id: string; nickname: string }[]).map(
      (p) => [p.id, p.nickname],
    ),
  );

  function renderRow(r: DeletionRow) {
    const post = postById.get(r.post_id);
    const nickname = nicknameById.get(r.requester_id) ?? "?";
    return (
      <article
        key={r.id}
        className="rounded-2xl border border-wabi bg-white/70 p-4"
      >
        <header className="flex flex-wrap items-center justify-between gap-2 text-xs text-sumi/70">
          <div>
            <strong className="text-ink">{nickname}</strong> から削除申請
            {" • "}申請: {formatDate(r.created_at)}
            {r.reviewed_at ? <> • 処理: {formatDate(r.reviewed_at)}</> : null}
          </div>
          <span
            className={`rounded-full px-2 py-0.5 ${
              r.status === "pending"
                ? "bg-sakura/10 text-sakura"
                : r.status === "approved"
                  ? "bg-sumi/10 text-sumi"
                  : "bg-sage/10 text-sage"
            }`}
          >
            {r.status === "pending"
              ? "未処理"
              : r.status === "approved"
                ? "承認 (削除済)"
                : "却下"}
          </span>
        </header>

        {post ? (
          <div className="mt-3 rounded-xl bg-cream/40 p-3 text-sm">
            <p className="text-xs text-sumi/70">
              category: {post.category} • space: {post.space} • status:{" "}
              {post.status} • 返信 {post.reply_count} 件
            </p>
            <p className="mt-2 whitespace-pre-wrap text-ink">{post.body}</p>
            <p className="mt-2 text-xs">
              <Link
                href={`/post/${post.id}`}
                className="text-sage hover:underline"
              >
                投稿を見る →
              </Link>
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-sumi/60">投稿が削除されています。</p>
        )}

        {r.status === "pending" && (
          <div className="mt-3">
            <AdminDeletionActions id={r.id} />
          </div>
        )}
      </article>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="text-xs text-sumi hover:text-sage">
          ← モデレーション
        </Link>
        <h1 className="mt-2 font-display text-2xl text-ink">削除申請</h1>
        <p className="mt-1 text-xs text-sumi/70">
          未処理: {pending?.length ?? 0} 件 • 最近処理: {recent?.length ?? 0}{" "}
          件
        </p>
      </header>

      <section aria-labelledby="pending-heading" className="space-y-3">
        <h2 id="pending-heading" className="text-sm font-semibold text-ink">
          未処理の申請
        </h2>
        {pending && pending.length > 0 ? (
          (pending as DeletionRow[]).map(renderRow)
        ) : (
          <p className="rounded-2xl border border-dashed border-wabi p-6 text-center text-sm text-sumi/60">
            未処理の申請はありません。
          </p>
        )}
      </section>

      {recent && recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="space-y-3">
          <h2 id="recent-heading" className="text-sm font-semibold text-ink">
            最近処理した申請
          </h2>
          {(recent as DeletionRow[]).map(renderRow)}
        </section>
      )}
    </div>
  );
}
