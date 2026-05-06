"use client";

import { useState, useTransition } from "react";

const PRESETS = [300, 500, 1000, 3000, 5000] as const;
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 1_000_000;

export function DonateForm() {
  const [amount, setAmount] = useState<number>(1000);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function selectPreset(p: number) {
    setAmount(p);
    setCustomMode(false);
    setError(null);
  }

  function selectCustom() {
    setCustomMode(true);
    setError(null);
  }

  function submit() {
    let n = amount;
    if (customMode) {
      const parsed = parseInt(customValue, 10);
      if (Number.isNaN(parsed)) {
        setError("数字を入力してください");
        return;
      }
      n = parsed;
    }
    if (n < MIN_AMOUNT || n > MAX_AMOUNT) {
      setError(
        `${MIN_AMOUNT.toLocaleString()} 円〜${MAX_AMOUNT.toLocaleString()} 円の範囲で指定してください`,
      );
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/donate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ amount: n }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "決済画面の作成に失敗しました");
        }
        window.location.href = data.url;
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="block text-sm font-semibold text-ink">金額を選ぶ</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = !customMode && amount === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => selectPreset(p)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-sage bg-sage text-cream"
                    : "border-wabi bg-white text-sumi hover:border-sage hover:text-sage"
                }`}
              >
                ¥{p.toLocaleString()}
              </button>
            );
          })}
          <button
            type="button"
            onClick={selectCustom}
            aria-pressed={customMode}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              customMode
                ? "border-sage bg-sage text-cream"
                : "border-wabi bg-white text-sumi hover:border-sage hover:text-sage"
            }`}
          >
            自由に決める
          </button>
        </div>
      </div>

      {customMode && (
        <label className="block">
          <span className="block text-sm font-semibold text-ink">金額 (円)</span>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={100}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="例: 1000"
            className="mt-2 block w-full rounded-2xl border border-wabi bg-white px-4 py-3 text-base text-ink outline-none focus:border-sage"
          />
          <span className="mt-1 block text-xs text-sumi/60">
            {MIN_AMOUNT.toLocaleString()} 円〜{MAX_AMOUNT.toLocaleString()} 円
          </span>
        </label>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className="w-full rounded-2xl bg-sage px-6 py-3 text-base font-semibold text-cream transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "決済画面に移動中…" : "🌱 サポートする"}
      </button>

      <p className="text-xs leading-relaxed text-sumi/70">
        ご支援は <strong>V-Corp (屋号)</strong> の事業収入として処理されます
        (贈与ではなく、サービス運営への任意のサポートです)。
        領収書が必要な方は{" "}
        <a
          href="mailto:arata@v-corp.inc?subject=サポートの領収書希望"
          className="text-sage hover:underline"
        >
          arata@v-corp.inc
        </a>{" "}
        までお問い合わせください。
      </p>
    </div>
  );
}
