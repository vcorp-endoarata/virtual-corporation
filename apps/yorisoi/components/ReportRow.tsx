"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Report = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  reasonLabel: string;
  detail: string | null;
  status: string;
  created_at: string;
  reporter_nickname: string;
};

type Post = {
  id: string;
  body: string;
  space: string;
  status: string;
  author: { id: string; nickname: string; role: string };
};

const ACTIONS = [
  { value: "dismiss", label: "問題なし (棄却)", danger: false },
  { value: "hide_post", label: "投稿を非表示", danger: false },
  { value: "delete_post", label: "投稿を削除", danger: true },
  { value: "warn_user", label: "ユーザーに警告", danger: false },
  { value: "suspend_user_24h", label: "ユーザー一時停止 (24時間)", danger: true },
  { value: "suspend_user_7d", label: "ユーザー一時停止 (7日)", danger: true },
  { value: "ban_user", label: "ユーザー恒久 BAN", danger: true },
] as const;

function timeAgo(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  if (min < 1440) return `${Math.floor(min / 60)}時間前`;
  return `${Math.floor(min / 1440)}日前`;
}

export function ReportRow({
  report,
  post,
}: {
  report: Report;
  post: Post | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resolve(action: string) {
    if (!confirm(`本当に「${action}」を実行しますか?`)) return;
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch(`/api/admin/reports/${report.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action, note: note.trim() || null }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "対応に失敗しました");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが起きました");
      }
    });
  }

  return (
    <article className="rounded-2xl border border-wabi bg-white/70 p-5">
      <header className="flex items-start justify-between gap-3 text-xs text-sumi/70">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sage/15 px-2 py-0.5 text-sage">
            {report.reasonLabel}
          </span>
          <span>
            通報者: <span className="text-ink">{report.reporter_nickname}</span>
          </span>
          <span>{timeAgo(report.created_at)}</span>
          {report.status !== "pending" && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
              {report.status}
            </span>
          )}
        </div>
      </header>

      {report.detail && (
        <p className="mt-3 rounded-lg bg-sumi/5 p-3 text-sm text-sumi">
          通報詳細: {report.detail}
        </p>
      )}

      {post ? (
        <div className="mt-4 rounded-xl border border-wabi bg-cream/50 p-4">
          <p className="text-xs text-sumi/70">
            投稿者: <strong className="text-ink">{post.author.nickname}</strong> (
            {post.author.role}) • space: {post.space} • status: {post.status}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{post.body}</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-sumi/60">
          対象: {report.target_type} ({report.target_id})
        </p>
      )}

      <div className="mt-4 space-y-3">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="対応メモ (任意)"
          className="w-full rounded-lg border border-wabi bg-white px-3 py-2 text-sm outline-none focus:border-sage"
        />
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => resolve(a.value)}
              disabled={isPending}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                a.danger
                  ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border border-wabi bg-white text-sumi hover:bg-sage/5"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
