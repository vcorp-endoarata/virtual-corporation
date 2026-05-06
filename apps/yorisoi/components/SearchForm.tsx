"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="気持ち、悩み、体験などを検索…"
        maxLength={100}
        autoFocus={!initialQuery}
        className="flex-1 rounded-full border border-wabi bg-white/80 px-5 py-2.5 text-sm text-ink placeholder:text-sumi/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
      />
      <button
        type="submit"
        className="rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-cream hover:opacity-90"
      >
        🔍 検索
      </button>
    </form>
  );
}
