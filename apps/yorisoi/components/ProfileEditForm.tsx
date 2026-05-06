"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

type Initial = {
  nickname: string;
  prefecture: string | null;
  city: string | null;
  bio: string | null;
};

export function ProfileEditForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nickname, setNickname] = useState(initial.nickname);
  const [prefecture, setPrefecture] = useState(initial.prefecture ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      setSaved(false);
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            nickname: nickname.trim(),
            prefecture: prefecture || null,
            city: city.trim() || null,
            bio: bio.trim() || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "保存できませんでした");
        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが起きました");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block text-sm font-semibold text-ink">
        ニックネーム
        <input
          type="text"
          required
          maxLength={30}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="mt-2 block w-full rounded-2xl border border-wabi bg-white px-5 py-3 text-base text-ink outline-none focus:border-sage"
        />
      </label>

      <label className="block text-sm font-semibold text-ink">
        都道府県 (任意)
        <select
          value={prefecture}
          onChange={(e) => setPrefecture(e.target.value)}
          className="mt-2 block w-full rounded-2xl border border-wabi bg-white px-5 py-3 text-base text-ink outline-none focus:border-sage"
        >
          <option value="">選択しない</option>
          {PREFECTURES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-semibold text-ink">
        市区町村 (任意)
        <input
          type="text"
          maxLength={50}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mt-2 block w-full rounded-2xl border border-wabi bg-white px-5 py-3 text-base text-ink outline-none focus:border-sage"
        />
        <span className="mt-1 block text-xs text-sumi/60">
          住所や番地は入力しないでください。
        </span>
      </label>

      <label className="block text-sm font-semibold text-ink">
        自己紹介 (任意・200字以内)
        <textarea
          maxLength={200}
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-2 block w-full resize-none rounded-2xl border border-wabi bg-white px-5 py-3 text-base text-ink outline-none focus:border-sage"
        />
        <span className="mt-1 block text-xs text-sumi/60">
          {bio.length} / 200
        </span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !nickname}
          className="rounded-2xl bg-sage px-6 py-3 text-base font-semibold text-cream transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "保存中…" : "保存する"}
        </button>
        {saved && (
          <span className="text-sm text-sage" role="status">
            保存しました
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
