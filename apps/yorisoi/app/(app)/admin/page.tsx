import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReportRow } from "@/components/ReportRow";

export const metadata = {
  title: "モデレーション — よりそい",
  robots: { index: false, follow: false },
};

const REASON_LABEL: Record<string, string> = {
  attack_individual: "個人攻撃",
  spam: "スパム",
  sexual: "性的内容",
  self_harm: "自傷",
  minor_safety: "未成年安全",
  no_consent_media: "同意無メディア",
  misinformation: "誤情報",
  other: "その他",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <div className="rounded-2xl border border-wabi bg-white/70 p-10 text-center">
        <p className="text-sm text-sumi">
          このページは運営者専用です。
        </p>
      </div>
    );
  }

  // pending reports + 関連 post 取得 (service_role でフルアクセス)
  const admin = createAdminClient();

  const { data: reports } = await admin
    .from("reports")
    .select(
      "id, target_type, target_id, reason, detail, status, created_at, reporter:profiles!reports_reporter_id_fkey(nickname)",
    )
    .in("status", ["pending", "reviewing"])
    .order("created_at", { ascending: false })
    .limit(50);

  // 関連 post を一括取得
  const postIds = (reports ?? [])
    .filter((r) => r.target_type === "post")
    .map((r) => r.target_id);
  const { data: posts } = postIds.length
    ? await admin
        .from("posts")
        .select(
          "id, body, space, status, created_at, author:profiles!posts_author_id_fkey(id, nickname, role)",
        )
        .in("id", postIds)
    : { data: [] };
  const postsById = new Map((posts ?? []).map((p) => [p.id, p]));

  const { data: stats } = await admin
    .from("reports")
    .select("status", { count: "exact", head: false });
  const counts = (stats ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl text-ink">モデレーション</h1>
        <p className="mt-1 text-xs text-sumi/70">
          運営者: {profile.nickname} • 通報 pending: {counts.pending ?? 0} /
          reviewing: {counts.reviewing ?? 0}
        </p>
        <nav className="mt-3 flex flex-wrap gap-2 text-xs">
          <a
            href="/admin/invites"
            className="rounded-full border border-wabi bg-white/70 px-3 py-1 text-sumi hover:bg-sage/5"
          >
            招待管理 →
          </a>
          <a
            href="/admin/deletions"
            className="rounded-full border border-wabi bg-white/70 px-3 py-1 text-sumi hover:bg-sage/5"
          >
            削除申請 →
          </a>
        </nav>
      </header>

      {!reports || reports.length === 0 ? (
        <div className="rounded-2xl border border-wabi bg-white/70 p-10 text-center text-sm text-sumi/70">
          現在、対応待ちの通報はありません。
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const post = r.target_type === "post" ? postsById.get(r.target_id) : null;
            return (
              <ReportRow
                key={r.id}
                report={{
                  id: r.id,
                  target_type: r.target_type,
                  target_id: r.target_id,
                  reason: r.reason,
                  reasonLabel: REASON_LABEL[r.reason] ?? r.reason,
                  detail: r.detail,
                  status: r.status,
                  created_at: r.created_at,
                  reporter_nickname:
                    (r.reporter as { nickname?: string } | null)?.nickname ?? "?",
                }}
                post={
                  post
                    ? {
                        id: post.id,
                        body: post.body,
                        space: post.space,
                        status: post.status,
                        author: post.author as unknown as {
                          id: string;
                          nickname: string;
                          role: string;
                        },
                      }
                    : null
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
