"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Kind = "block" | "mute";

export function RelationMenu({
  targetUserId,
  initialBlocked,
  initialMuted,
}: {
  targetUserId: string;
  initialBlocked: boolean;
  initialMuted: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [muted, setMuted] = useState(initialMuted);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }
  }, [open]);

  async function toggle(kind: Kind, currentValue: boolean) {
    setOpen(false);
    const action = currentValue ? "DELETE" : "POST";
    const url = currentValue
      ? `/api/users/${targetUserId}/relation?kind=${kind}`
      : `/api/users/${targetUserId}/relation`;

    startTransition(async () => {
      try {
        const res = await fetch(url, {
          method: action,
          headers: action === "POST" ? { "Content-Type": "application/json" } : {},
          body: action === "POST" ? JSON.stringify({ kind }) : undefined,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          alert(data?.error ?? "操作に失敗しました");
          return;
        }
        if (kind === "block") setBlocked(!currentValue);
        if (kind === "mute") setMuted(!currentValue);
        router.refresh();
      } catch {
        alert("通信エラーが発生しました");
      }
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="このユーザーの操作"
        title="操作メニュー"
        className="rounded-full border border-wabi bg-white/70 px-3 py-1.5 text-sm text-sumi hover:bg-sage/5"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-wabi bg-white shadow-lg">
          <button
            type="button"
            onClick={() => toggle("mute", muted)}
            disabled={isPending}
            className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm text-sumi hover:bg-sage/5 disabled:opacity-50"
          >
            <span aria-hidden className="mt-0.5">🔇</span>
            <span>
              {muted ? "ミュートを解除する" : "ミュートする"}
              <br />
              <span className="text-xs text-sumi/60">
                {muted
                  ? "再びこの人の投稿が自分のフィードに表示されます"
                  : "この人の投稿を 自分のフィードから 見えなくします (相手にはバレません)"}
              </span>
            </span>
          </button>
          <hr className="border-wabi/40" />
          <button
            type="button"
            onClick={() => toggle("block", blocked)}
            disabled={isPending}
            className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm text-sumi hover:bg-sakura/5 disabled:opacity-50"
          >
            <span aria-hidden className="mt-0.5">🚫</span>
            <span>
              {blocked ? "ブロックを解除する" : "ブロックする"}
              <br />
              <span className="text-xs text-sumi/60">
                {blocked
                  ? "再び自分の投稿がこの人のフィードに表示されるようになります"
                  : "自分の投稿を この人のフィードに表示させなくします (相手にはバレません)"}
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
