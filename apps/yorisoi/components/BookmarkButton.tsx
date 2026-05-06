"use client";

import { useState, useTransition } from "react";

export function BookmarkButton({
  postId,
  initialActive,
}: {
  postId: string;
  initialActive: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);

  function toggle() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/bookmark`, {
          method: next ? "POST" : "DELETE",
        });
        if (!res.ok) {
          setActive(!next);
          return;
        }
        setFlash(next ? "✓ 保存しました" : "解除しました");
        setTimeout(() => setFlash(null), 1500);
      } catch {
        setActive(!next);
      }
    });
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-label={active ? "ブックマーク解除" : "ブックマーク"}
        title={active ? "ブックマーク解除" : "ブックマーク"}
        aria-pressed={active}
        className={`flex items-center rounded-full px-3 py-1.5 text-base whitespace-nowrap transition disabled:opacity-50 ${
          active
            ? "bg-sage/15 text-sage"
            : "text-sumi/70 hover:bg-sage/10 hover:text-sage"
        }`}
      >
        <span aria-hidden>🔖</span>
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
