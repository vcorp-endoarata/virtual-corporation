"use client";

import { useState } from "react";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error ?? "決済画面の準備に失敗しました");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "通信エラーが発生しました",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-full bg-sage px-6 py-3 text-sm font-semibold text-cream transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "準備中…" : "サブスクを始める"}
      </button>
      <p className="mt-2 text-center text-xs text-sumi/70">
        14日間 無料トライアル / その後 月額¥300 (税込)
        <br />
        いつでも解約できます。
      </p>
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-sakura/10 p-3 text-xs text-sakura"
        >
          {error}
        </p>
      )}
    </div>
  );
}
