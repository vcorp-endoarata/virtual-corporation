"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Mode = "immediate" | "requested" | "requested_already";

export function PostDeleteButton({
  postId,
  isAdmin = false,
}: {
  postId: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [resultMode, setResultMode] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function execute() {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch(`/api/posts/${postId}/delete`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "削除に失敗しました");
        setResultMode(data.mode as Mode);
        if (data.mode === "immediate") {
          setTimeout(() => router.refresh(), 800);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "削除に失敗しました");
      }
    });
  }

  if (resultMode === "immediate") {
    return (
      <span
        role="status"
        className="inline-block rounded-full bg-sumi/10 px-3 py-1 text-xs text-sumi"
      >
        ✓ 削除しました
      </span>
    );
  }

  if (resultMode === "requested" || resultMode === "requested_already") {
    return (
      <span
        role="status"
        className="inline-block rounded-full bg-sage/10 px-3 py-1 text-xs text-sage"
      >
        {resultMode === "requested_already"
          ? "✓ 既に申請済みです"
          : "✓ 削除申請を送りました"}
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        title={isAdmin ? "この投稿を削除" : "この投稿の削除を申請"}
        aria-label={isAdmin ? "この投稿を削除" : "この投稿の削除を申請"}
        className="flex items-center rounded-full px-3 py-1.5 text-base text-sumi/70 whitespace-nowrap hover:bg-red-50 hover:text-red-600"
      >
        <span aria-hidden>🗑</span>
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50/40 px-3 py-1.5 text-xs">
      <span className="text-sumi">
        {isAdmin
          ? "本当に削除しますか?"
          : "削除を申請します。運営者の確認後に削除されます。よろしいですか?"}
      </span>
      <button
        type="button"
        onClick={execute}
        disabled={isPending}
        className="rounded-full bg-red-600 px-3 py-0.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? "処理中…" : isAdmin ? "削除" : "申請する"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="rounded-full border border-wabi bg-white px-3 py-0.5 text-sumi hover:bg-sage/5 disabled:opacity-50"
      >
        キャンセル
      </button>
      {error && (
        <span className="block w-full text-red-600" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
