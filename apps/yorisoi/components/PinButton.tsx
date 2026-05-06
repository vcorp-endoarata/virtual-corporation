"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function PinButton({
  postId,
  initialPinned,
}: {
  postId: string;
  initialPinned: boolean;
}) {
  const router = useRouter();
  const [pinned, setPinned] = useState(initialPinned);
  const [isPending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);

  function toggle() {
    const next = !pinned;
    setPinned(next);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/pin`, {
          method: next ? "POST" : "DELETE",
        });
        if (!res.ok) {
          setPinned(!next);
          const data = await res.json().catch(() => null);
          alert(data?.error ?? "操作に失敗しました");
          return;
        }
        setFlash(next ? "✓ ピン留めしました" : "解除しました");
        setTimeout(() => setFlash(null), 1500);
        router.refresh();
      } catch {
        setPinned(!next);
      }
    });
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={pinned}
        aria-label={pinned ? "ピン留めを解除" : "プロフィールにピン留め"}
        title={pinned ? "ピン留めを解除" : "プロフィールにピン留め"}
        className={`flex items-center rounded-full px-3 py-1.5 text-base whitespace-nowrap transition disabled:opacity-50 ${
          pinned
            ? "bg-sage/15 text-sage"
            : "text-sumi/70 hover:bg-sage/10 hover:text-sage"
        }`}
      >
        <span aria-hidden>📌</span>
      </button>
      {flash && (
        <span
          role="status"
          className="pointer-events-none absolute -top-7 right-0 whitespace-nowrap rounded-full bg-sage px-2 py-0.5 text-[10px] text-cream shadow"
        >
          {flash}
        </span>
      )}
    </span>
  );
}
