import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkAllReadButton } from "@/components/MarkAllReadButton";

export const metadata = {
  title: "通知 — よりそい",
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<string, string> = {
  self: "当事者",
  family: "家族",
  supporter: "支援者",
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

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS で本人宛のみ取得
  const { data: notifications } = await supabase
    .from("notifications")
    .select(
      "id, kind, post_id, reply_id, read_at, created_at, actor:profiles!notifications_actor_id_fkey(id, nickname, role, show_role)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const hasUnread = (notifications ?? []).some((n) => !n.read_at);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">通知</h1>
        {hasUnread && <MarkAllReadButton />}
      </header>

      {!notifications || notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-wabi p-10 text-center text-sm text-sumi/70">
          まだ通知はありません。
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const actor = n.actor as unknown as {
              id: string;
              nickname: string;
              role: string;
              show_role?: boolean;
            } | null;
            const actorName = actor?.nickname ?? "誰か";
            const showRole = actor?.show_role !== false;
            const role = actor?.role ? ROLE_LABEL[actor.role] ?? actor.role : "";
            const isUnread = !n.read_at;

            const message =
              n.kind === "unazuki"
                ? "あなたの投稿にうなずきました"
                : "あなたの投稿に返信しました";

            const href = n.post_id ? `/post/${n.post_id}` : "/feed";
            const icon = n.kind === "unazuki" ? "🌿" : "💬";

            return (
              <li key={n.id}>
                <Link
                  href={href}
                  className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                    isUnread
                      ? "border-sage/30 bg-sage/5"
                      : "border-wabi bg-white/60 hover:bg-sage/5"
                  }`}
                >
                  <span aria-hidden className="text-xl">{icon}</span>
                  <div className="flex-1 text-sm">
                    <p className="text-ink">
                      <span className="font-semibold">{actorName}</span>
                      {showRole && role && (
                        <span className="ml-2 rounded-full bg-sage/10 px-2 py-0.5 text-xs text-sage">
                          {role}
                        </span>
                      )}
                      <span className="ml-2 text-sumi">{message}</span>
                    </p>
                    <p className="mt-1 text-xs text-sumi/60">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {isUnread && (
                    <span
                      aria-label="未読"
                      className="mt-1 h-2 w-2 rounded-full bg-sakura"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
