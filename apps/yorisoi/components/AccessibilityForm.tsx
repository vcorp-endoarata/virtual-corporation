"use client";
import { useState, useTransition } from "react";

type A11y = {
  font_size: "small" | "medium" | "large";
  theme: "light" | "dark";
};

const SIZE_OPTIONS = [
  { value: "small", label: "小", sample: "text-sm" },
  { value: "medium", label: "標準", sample: "text-base" },
  { value: "large", label: "大", sample: "text-lg" },
] as const;

export function AccessibilityForm({ initial }: { initial: A11y }) {
  const [a11y, setA11y] = useState<A11y>(initial);
  const [isPending, startTransition] = useTransition();
  const [savedKey, setSavedKey] = useState<keyof A11y | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof A11y>(key: K, value: A11y[K]) {
    setA11y({ ...a11y, [key]: value });

    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/profile/preferences", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ [key]: value }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "保存できませんでした");
        setSavedKey(key);
        setTimeout(() => setSavedKey(null), 2000);
        // 即時反映
        if (key === "theme") {
          document.documentElement.classList.toggle(
            "theme-dark",
            value === "dark",
          );
        }
        if (key === "font_size") {
          const px =
            value === "small" ? 14 : value === "large" ? 18 : 16;
          document.documentElement.style.fontSize = `${px}px`;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが起きました");
      }
    });
  }

  return (
    <div className="space-y-3">
      {/* フォントサイズ */}
      <div className="rounded-xl border border-wabi bg-white/40 p-3">
        <div className="flex items-center justify-between text-sm font-semibold text-ink">
          <span>文字の大きさ</span>
          {savedKey === "font_size" && (
            <span className="text-xs text-sage" role="status">
              ✓ 保存しました
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-sumi/70">
          画面全体の文字サイズが変わります。
        </p>
        <div className="mt-3 flex gap-2">
          {SIZE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => update("font_size", o.value)}
              disabled={isPending}
              aria-pressed={a11y.font_size === o.value}
              className={`flex-1 rounded-lg border px-3 py-2 transition ${
                a11y.font_size === o.value
                  ? "border-sage bg-sage/10 text-ink"
                  : "border-wabi bg-white text-sumi hover:bg-sage/5"
              }`}
            >
              <span className={`block ${o.sample}`}>{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* テーマ (ダーク/ライト) */}
      <div className="rounded-xl border border-wabi bg-white/40 p-3">
        <div className="flex items-center justify-between text-sm font-semibold text-ink">
          <span>外観テーマ</span>
          {savedKey === "theme" && (
            <span className="text-xs text-sage" role="status">
              ✓ 保存しました
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-sumi/70">
          画面の明るさを切り替えできます。
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => update("theme", "light")}
            disabled={isPending}
            aria-pressed={a11y.theme === "light"}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
              a11y.theme === "light"
                ? "border-sage bg-sage/10 text-ink"
                : "border-wabi bg-white text-sumi hover:bg-sage/5"
            }`}
          >
            ☀️ ライト
          </button>
          <button
            type="button"
            onClick={() => update("theme", "dark")}
            disabled={isPending}
            aria-pressed={a11y.theme === "dark"}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
              a11y.theme === "dark"
                ? "border-sage bg-sage/10 text-ink"
                : "border-wabi bg-white text-sumi hover:bg-sage/5"
            }`}
          >
            🌙 ダーク
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
