"use client";
import { useState, useTransition } from "react";

type Privacy = {
  show_role: boolean;
  show_prefecture: boolean;
  show_city: boolean;
  show_bio: boolean;
};

const ITEMS: { key: keyof Privacy; label: string; desc: string }[] = [
  {
    key: "show_role",
    label: "立場 (当事者・家族・支援者) を見せる",
    desc: "OFF にすると、投稿カードや プロフィールに role バッジが表示されなくなります",
  },
  {
    key: "show_prefecture",
    label: "都道府県を見せる",
    desc: "OFF にすると、他のユーザーに都道府県が表示されません",
  },
  {
    key: "show_city",
    label: "市区町村を見せる",
    desc: "OFF にすると、他のユーザーに市区町村が表示されません",
  },
  {
    key: "show_bio",
    label: "自己紹介を見せる",
    desc: "OFF にすると、他のユーザーに自己紹介文が表示されません",
  },
];

export function PrivacyForm({ initial }: { initial: Privacy }) {
  const [privacy, setPrivacy] = useState<Privacy>(initial);
  const [isPending, startTransition] = useTransition();
  const [savedKey, setSavedKey] = useState<keyof Privacy | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: keyof Privacy) {
    const newVal = !privacy[key];
    setPrivacy({ ...privacy, [key]: newVal });

    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/profile/privacy", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ [key]: newVal }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "保存できませんでした");
        setSavedKey(key);
        setTimeout(() => setSavedKey(null), 2000);
      } catch (err) {
        // 失敗時はロールバック
        setPrivacy({ ...privacy, [key]: !newVal });
        setError(err instanceof Error ? err.message : "エラーが起きました");
      }
    });
  }

  return (
    <div className="space-y-3">
      {ITEMS.map(({ key, label, desc }) => (
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
                <span
                  className="text-xs text-sage"
                  role="status"
                  aria-live="polite"
                >
                  ✓ 保存しました
                </span>
              )}
              <input
                type="checkbox"
                checked={privacy[key]}
                onChange={() => toggle(key)}
                disabled={isPending}
                className="h-5 w-5 cursor-pointer accent-sage"
              />
            </span>
          </label>
        </div>
      ))}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
