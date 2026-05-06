import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AdminGenerateButton,
  AdminInviteWaitlistButton,
  CopyableCode,
} from "@/components/AdminInvitePanel";
import { isInviteRequired } from "@/lib/invite";

export const metadata = {
  title: "招待管理 — よりそい",
  robots: { index: false, follow: false },
};

type Filter = "unused" | "used" | "all";

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

export default async function AdminInvitesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
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

  const params = await searchParams;
  const filter: Filter = ((params.filter ?? "unused") as Filter) ?? "unused";

  const admin = createAdminClient();

  // 招待コード一覧
  let codeQuery = admin
    .from("invite_codes")
    .select("code, source, used_by, used_at, expires_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter === "unused") codeQuery = codeQuery.is("used_by", null);
  if (filter === "used") codeQuery = codeQuery.not("used_by", "is", null);
  const { data: codes } = await codeQuery;

  // 使用者の nickname を別途取得 (FK chain が PostgREST embed では追えないため)
  const usedIds = (codes ?? [])
    .map((c) => c.used_by)
    .filter((v): v is string => !!v);
  const { data: usedProfiles } = usedIds.length
    ? await admin.from("profiles").select("id, nickname").in("id", usedIds)
    : { data: [] };
  const nicknameById = new Map(
    (usedProfiles ?? []).map((p) => [p.id, p.nickname]),
  );

  // ウェイトリスト一覧 (未招待 → 招待済 の順)
  const { data: waitlist } = await admin
    .from("waitlist")
    .select("id, email, registered_at, invited_at, invite_code")
    .eq("product", "yorisoi")
    .order("invited_at", { ascending: true, nullsFirst: true })
    .order("registered_at", { ascending: true })
    .limit(200);

  // 使用状況集計
  const { count: unusedCount } = await admin
    .from("invite_codes")
    .select("code", { count: "exact", head: true })
    .is("used_by", null);
  const { count: usedCount } = await admin
    .from("invite_codes")
    .select("code", { count: "exact", head: true })
    .not("used_by", "is", null);
  const { count: pendingWaitlist } = await admin
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .eq("product", "yorisoi")
    .is("invited_at", null);

  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin" className="text-xs text-sumi hover:text-sage">
          ← モデレーション
        </Link>
        <h1 className="mt-2 font-display text-2xl text-ink">招待管理</h1>
        <p className="mt-1 text-xs text-sumi/70">
          INVITE_REQUIRED:{" "}
          <strong className={isInviteRequired() ? "text-sage" : "text-sumi"}>
            {isInviteRequired() ? "true (招待制)" : "false (公開)"}
          </strong>
          {" • "}
          未使用: {unusedCount ?? 0} • 使用済: {usedCount ?? 0} •
          ウェイトリスト未招待: {pendingWaitlist ?? 0}
        </p>
      </header>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">① コード一括生成</h2>
        <p className="mt-1 text-xs text-sumi/70">
          手動配布用 (X リプライ等) の招待コードを生成します。
        </p>
        <div className="mt-4">
          <AdminGenerateButton />
        </div>
      </section>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">
          ② ウェイトリストから招待 (Resend 自動送信)
        </h2>
        <p className="mt-1 text-xs text-sumi/70">
          未招待の先頭 N 人に、コード生成 + 招待メール送信を一括実行します。
        </p>
        <div className="mt-4">
          <AdminInviteWaitlistButton />
        </div>
      </section>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">③ コード一覧</h2>
          <nav className="flex gap-2 text-xs">
            {(["unused", "used", "all"] as const).map((f) => (
              <Link
                key={f}
                href={`/admin/invites?filter=${f}`}
                className={`rounded-full border px-3 py-0.5 ${
                  filter === f
                    ? "border-sage bg-sage text-cream"
                    : "border-wabi bg-white text-sumi"
                }`}
              >
                {f === "unused"
                  ? "未使用"
                  : f === "used"
                    ? "使用済"
                    : "すべて"}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-wabi text-left text-sumi/70">
              <tr>
                <th className="py-2 pr-3">code</th>
                <th className="py-2 pr-3">source</th>
                <th className="py-2 pr-3">used_by</th>
                <th className="py-2 pr-3">used_at</th>
                <th className="py-2 pr-3">created_at</th>
              </tr>
            </thead>
            <tbody>
              {(codes ?? []).map((c) => (
                <tr key={c.code} className="border-b border-wabi/40">
                  <td className="py-2 pr-3 font-mono">
                    {c.used_by ? (
                      <span className="text-sumi/60">{c.code}</span>
                    ) : (
                      <CopyableCode code={c.code} />
                    )}
                  </td>
                  <td className="py-2 pr-3">{c.source}</td>
                  <td className="py-2 pr-3">
                    {c.used_by ? nicknameById.get(c.used_by) ?? "?" : "-"}
                  </td>
                  <td className="py-2 pr-3">{formatDate(c.used_at)}</td>
                  <td className="py-2 pr-3">{formatDate(c.created_at)}</td>
                </tr>
              ))}
              {(!codes || codes.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-sumi/60">
                    該当するコードはありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">④ ウェイトリスト</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-wabi text-left text-sumi/70">
              <tr>
                <th className="py-2 pr-3">email</th>
                <th className="py-2 pr-3">registered_at</th>
                <th className="py-2 pr-3">invited_at</th>
                <th className="py-2 pr-3">invite_code</th>
              </tr>
            </thead>
            <tbody>
              {(waitlist ?? []).map((w) => (
                <tr key={w.id} className="border-b border-wabi/40">
                  <td className="py-2 pr-3">{w.email}</td>
                  <td className="py-2 pr-3">{formatDate(w.registered_at)}</td>
                  <td className="py-2 pr-3">
                    {w.invited_at ? (
                      <span className="rounded-full bg-sage/10 px-2 py-0.5 text-sage">
                        {formatDate(w.invited_at)}
                      </span>
                    ) : (
                      <span className="text-sumi/60">未招待</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 font-mono text-sumi/60">
                    {w.invite_code ?? "-"}
                  </td>
                </tr>
              ))}
              {(!waitlist || waitlist.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-sumi/60">
                    ウェイトリスト登録はまだありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
