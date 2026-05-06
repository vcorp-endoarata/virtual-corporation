"use client";
import { useState, useTransition, useEffect } from "react";

const REASONS = [
  { value: "attack_individual", label: "個人を攻撃する内容" },
  { value: "spam", label: "スパム・宣伝" },
  { value: "sexual", label: "性的・不適切な内容" },
  { value: "self_harm", label: "自傷を促す内容" },
  { value: "minor_safety", label: "未成年の安全に関わる内容" },
  { value: "no_consent_media", label: "本人同意のない写真・動画" },
  { value: "misinformation", label: "誤った医療情報" },
  { value: "other", label: "その他" },
] as const;

export function ReportModal({
  targetType,
  targetId,
  onClose,
}: {
  targetType: "post" | "user" | "media" | "reply";
  targetId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<typeof REASONS[number]["value"]>(
    "attack_individual",
  );
  const [detail, setDetail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // ESC で閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/reports", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            target_type: targetType,
            target_id: targetId,
            reason,
            detail: detail.trim() || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "通報できませんでした");
        setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが起きました");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl"
      >
        {done ? (
          <div className="text-center">
            <p className="font-display text-xl text-ink">通報を受け付けました</p>
            <p className="mt-3 text-sm leading-relaxed text-sumi">
              内容を確認の上、24時間以内に対応します。
              <br />
              ご協力ありがとうございます。
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-sage px-6 py-2 text-sm font-semibold text-cream"
            >
              閉じる
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <h2 className="font-display text-xl text-ink">通報</h2>
            <p className="mt-2 text-xs text-sumi">
              通報者の匿名性は保護されます。投稿者には通知されません。
            </p>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-ink">
                通報の理由
              </legend>
              <div className="mt-2 space-y-1.5">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm hover:bg-sage/5"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="accent-sage"
                    />
                    <span className="text-sumi">{r.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 block text-sm font-semibold text-ink">
              詳細 (任意)
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="状況を補足する必要があれば"
                className="mt-2 block w-full resize-none rounded-xl border border-wabi bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sage"
              />
            </label>

            {error && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-wabi px-4 py-2 text-sm text-sumi hover:bg-sage/5"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-sage px-5 py-2 text-sm font-semibold text-cream disabled:opacity-50"
              >
                {isPending ? "送信中…" : "通報する"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
