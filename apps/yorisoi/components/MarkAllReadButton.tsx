"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function MarkAllReadButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handle() {
    const res = await fetch("/api/notifications/read-all", { method: "POST" });
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={isPending}
      className="rounded-full border border-wabi bg-white/70 px-3 py-1.5 text-xs text-sumi hover:bg-sage/5 disabled:opacity-50"
    >
      {isPending ? "更新中…" : "すべて既読にする"}
    </button>
  );
}
