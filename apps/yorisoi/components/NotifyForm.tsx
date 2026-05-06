"use client";
import { useState, useTransition } from "react";

type Notify = {
  notify_unazuki: boolean;
  notify_reply: boolean;
  notify_admin_response: boolean;
  notify_email_freq: "realtime" | "daily" | "weekly" | "never";
};

const TOGGLES: { key: keyof Notify; label: string; desc: string }[] = [
  {
    key: "notify_unazuki",
    label: "うなずきがついた時",
    desc: "自分の投稿にうなずきがついた時にお知らせ",
  },
  {
    key: "notify_reply",
    label: "反応があった時",
    desc: "自分の投稿に何らかの反応があった時にお知らせ (将来機能含む)",
  },
  {
    key: "notify_admin_response",
    label: "通報対応の結果",
    desc: "あなたが提出した通報の対応が確定した時にお知らせ",
  },
];

const FREQ_OPTIONS = [
  { value: "realtime", label: "即時" },
  { value: "daily", label: "1日1回まとめて" },
  { value: "weekly", label: "1週間に1回まとめて" },
  { value: "never", label: "メールは送らない" },
] as const;

export function NotifyForm({ initial }: { initial: Notify }) {
  const [notify, setNotify] = useState<Notify>(initial);
  const [isPending, startTransition] = useTransition();
  const [savedKey, setSavedKey] = useState<keyof Notify | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Notify>(key: K, value: Notify[K]) {
    setNotify({ ...notify, [key]: value });

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
      } catch (err) {
        setNotify({ ...notify, [key]: !value as never });
        setError(err instanceof Error ? err.message : "エラーが起きました");
      }
    });
  }

  return (
    <div className="space-y-3">
      {TOGGLES.map(({ key, label, desc }) => (
        <div
          key={key}
          className="rounded-xl border border-wabi bg-white/40 p-3"
        >
          <label className="flex cursor-pointer items-start justify-between gap-3">
            <span className="flex-1">
              <span className="block text-sm font-semibold text-ink">
                {label}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-sumi/70">
                {desc}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 pt-0.5">
              {savedKey === key && (
                <span className="text-xs text-sage" role="status">
                  ✓ 保存しました
                </span>
              )}
              <input
                type="checkbox"
                checked={notify[key] as boolean}
                onChange={(e) => update(key, e.target.checked as never)}
                disabled={isPending}
                className="h-5 w-5 cursor-pointer accent-sage"
              />
            </span>
          </label>
        </div>
      ))}

      <div className="rounded-xl border border-wabi bg-white/40 p-3">
        <label className="block">
          <span className="block text-sm font-semibold text-ink">
            メール通知の頻度
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-sumi/70">
            上記の通知をどのタイミングでメールで受け取るか
          </span>
          <div className="mt-2 flex items-center gap-2">
            <select
              value={notify.notify_email_freq}
              onChange={(e) =>
                update(
                  "notify_email_freq",
                  e.target.value as Notify["notify_email_freq"],
                )
              }
              disabled={isPending}
              className="flex-1 rounded-lg border border-wabi bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sage"
            >
              {FREQ_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {savedKey === "notify_email_freq" && (
              <span className="text-xs text-sage" role="status">
                ✓ 保存しました
              </span>
            )}
          </div>
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
