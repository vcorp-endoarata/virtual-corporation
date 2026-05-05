"use client";

import { useState, useTransition } from "react";

const PRESETS = [500, 1000, 3000, 5000] as const;
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 1_000_000;

type Mode = (typeof PRESETS)[number] | "custom";

export function DonateForm() {
  const [mode, setMode] = useState<Mode>(1000);
  const [customAmount, setCustomAmount] = useState<number>(1000);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const amount = mode === "custom" ? customAmount : mode;
  const amountValid =
    Number.isInteger(amount) && amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!amountValid) {
      setError(
        `金額は ¥${MIN_AMOUNT.toLocaleString()} 〜 ¥${MAX_AMOUNT.toLocaleString()} の範囲で入力してください。`,
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/donate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });
        const data = (await res.json()) as { url?: string; message?: string };
        if (!res.ok || !data.url) {
          setError(
            data.message ??
              "決済画面の準備に失敗しました。時間をおいて再度お試しください。",
          );
          return;
        }
        window.location.href = data.url;
      } catch {
        setError("通信に失敗しました。時間をおいて再度お試しください。");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <label className="block text-xs tracking-[0.2em] text-sakura-300 uppercase mb-3">
          金額を選ぶ
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={mode === p}
              onClick={() => setMode(p)}
              className="py-3 rounded-lg border border-cream-300 bg-cream-50 text-sage-700 text-sm font-medium transition-colors hover:bg-cream-100 aria-pressed:bg-sage-700 aria-pressed:text-cream-50 aria-pressed:border-sage-700"
            >
              ¥{p.toLocaleString()}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={mode === "custom"}
            onClick={() => setMode("custom")}
            className="py-3 rounded-lg border border-cream-300 bg-cream-50 text-sage-700 text-sm font-medium transition-colors hover:bg-cream-100 aria-pressed:bg-sage-700 aria-pressed:text-cream-50 aria-pressed:border-sage-700"
          >
            自由入力
          </button>
        </div>
        {mode === "custom" && (
          <div className="mt-4">
            <label className="block text-xs text-sage-500 mb-2">
              金額 (¥{MIN_AMOUNT.toLocaleString()} 〜 ¥{MAX_AMOUNT.toLocaleString()})
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sage-700 text-lg">¥</span>
              <input
                type="number"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step={100}
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="flex-1 px-4 py-3 bg-cream-50 border border-cream-300 rounded-lg text-sage-900 focus:outline-none focus:border-sage-500 transition-colors"
                inputMode="numeric"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !amountValid}
        className="w-full py-4 bg-sage-700 text-cream-50 rounded-lg font-medium transition-[transform,background-color,opacity] hover:bg-sage-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Stripe に移動中..."
          : amountValid
            ? `¥${amount.toLocaleString()} でサポートする →`
            : "金額を入力してください"}
      </button>

      <p className="text-xs text-sage-400 leading-[1.8]">
        ご支援は <strong className="text-sage-700">V-Corp (屋号)</strong> の事業収入として処理されます (贈与ではなく、サービス運営への任意のサポートです)。
        領収書が必要な方は{" "}
        <a
          href="mailto:arata@v-corp.inc"
          className="underline hover:text-sage-700"
        >
          arata@v-corp.inc
        </a>
        {" "}までお問い合わせください。
      </p>
    </form>
  );
}
