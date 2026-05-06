"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Relation = {
  target_id: string;
  kind: "block" | "mute";
  target: {
    id: string;
    nickname: string;
  };
};

export function RelationsList({ relations }: { relations: Relation[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (relations.length === 0) {
    return (
      <p className="text-xs text-sumi/60">
        ブロックまたはミュート中のユーザーはいません。
      </p>
    );
  }

  async function unblock(targetId: string, kind: "block" | "mute") {
    const id = `${targetId}-${kind}`;
    setPendingId(id);
    try {
      const res = await fetch(
        `/api/users/${targetId}/relation?kind=${kind}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        startTransition(() => router.refresh());
      } else {
        alert("解除に失敗しました");
      }
    } finally {
      setPendingId(null);
    }
  }

  return (
    <ul className="space-y-2">
      {relations.map((r) => {
        const id = `${r.target_id}-${r.kind}`;
        return (
          <li
            key={id}
            className="flex flex-col gap-2 rounded-xl border border-wabi bg-white/40 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    r.kind === "block"
                      ? "bg-sakura/10 text-sakura"
                      : "bg-sumi/10 text-sumi"
                  }`}
                >
                  {r.kind === "block" ? "🚫 ブロック中" : "🔇 ミュート中"}
                </span>
                <Link
                  href={`/user/${r.target_id}`}
                  className="text-ink hover:underline"
                >
                  {r.target.nickname}
                </Link>
              </div>
              <p className="text-xs text-sumi/60">
                {r.kind === "block"
                  ? "自分の投稿が この人のフィードに表示されません"
                  : "この人の投稿が 自分のフィードに表示されません"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => unblock(r.target_id, r.kind)}
              disabled={pendingId === id}
              className="self-end rounded-full border border-wabi bg-white px-3 py-1 text-xs text-sumi hover:bg-sage/5 disabled:opacity-50 sm:self-auto"
            >
              {pendingId === id ? "解除中…" : "解除する"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
