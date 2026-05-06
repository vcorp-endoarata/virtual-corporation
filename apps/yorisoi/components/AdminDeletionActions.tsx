"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function AdminDeletionActions({ id }: { id: string }) {
  const router = useRouter();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function act(action: "approve" | "reject") {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch(`/api/admin/deletions/${id}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action,
            note: action === "reject" ? note.trim() || null : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "処理に失敗しました");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "処理に失敗しました");
      }
    });
  }

  if (!showRejectForm) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (confirm("この申請を承認し、投稿を削除します。よろしいですか?")) {
              act("approve");
            }
          }}
          disabled={isPending}
          className="rounded-full bg-red-600 px-4 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          承認 (削除実行)
        </button>
        <button
          type="button"
          onClick={() => setShowRejectForm(true)}
          disabled={isPending}
          className="rounded-full border border-wabi bg-white px-4 py-1 text-xs text-sumi hover:bg-sage/5 disabled:opacity-50"
        >
          却下
        </button>
        {error && (
          <span className="text-xs text-red-600" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="却下の理由 (任意、申請者に表示はしない記録用)"
        rows={2}
        maxLength={500}
        className="w-full rounded-xl border border-wabi bg-white px-3 py-2 text-xs text-ink"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => act("reject")}
          disabled={isPending}
          className="rounded-full bg-sumi px-4 py-1 text-xs font-semibold text-cream hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "処理中…" : "却下を確定"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowRejectForm(false);
            setNote("");
          }}
          disabled={isPending}
          className="rounded-full border border-wabi bg-white px-4 py-1 text-xs text-sumi hover:bg-sage/5 disabled:opacity-50"
        >
          戻る
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
