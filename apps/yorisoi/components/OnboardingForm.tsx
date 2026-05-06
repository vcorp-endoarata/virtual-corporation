"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOnboardingProfile } from "@/app/onboarding/actions";

const ROLES = [
  { value: "self", label: "当事者", desc: "発達障害を持っています" },
  { value: "family", label: "家族・身近な人", desc: "当事者の家族や友人です" },
  { value: "supporter", label: "支援者・専門家", desc: "支援職や医療職です" },
] as const;

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

export function OnboardingForm({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState<"self" | "family" | "supporter" | "">("");
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role || !nickname || !agree) return;

    startTransition(async () => {
      setError(null);
      try {
        await createOnboardingProfile({
          userId,
          email,
          nickname,
          role,
          prefecture: prefecture || null,
          city: city || null,
          bio: bio || null,
        });
        router.push("/feed");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "登録中にエラーが起きました",
        );
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-12 space-y-6">
      {/* Role */}
      <fieldset>
        <legend className="text-sm font-semibold text-ink">
          あなたの立場 <span className="text-red-500">*</span>
        </legend>
        <div className="mt-3 space-y-2">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                role === r.value
                  ? "border-sage bg-sage/5"
                  : "border-wabi bg-white hover:border-sage/40"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={role === r.value}
                onChange={() => setRole(r.value)}
                required
                className="mt-1 accent-sage"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">
                  {r.label}
                </span>
                <span className="text-xs text-sumi/70">{r.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Nickname */}
      <label className="block text-sm font-semibold text-ink">
        ニックネーム <span className="text-red-500">*</span>
        <input
          type="text"
          required
          maxLength={30}
          placeholder="例: もりのねこ"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="mt-2 block w-full rounded-2xl border border-wabi bg-white px-5 py-3 text-base text-ink outline-none placeholder:text-ink/30 focus:border-sage"
        />
        <span className="mt-1 block text-xs text-sumi/60">
          本名を避け、推測されにくいものを推奨します。あとで変更できます。
        </span>
      </label>

      {/* Prefecture (任意) */}
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

      {/* City (任意) */}
      <label className="block text-sm font-semibold text-ink">
        市区町村 (任意)
        <input
          type="text"
          maxLength={50}
          placeholder="例: 江戸川区"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mt-2 block w-full rounded-2xl border border-wabi bg-white px-5 py-3 text-base text-ink outline-none placeholder:text-ink/30 focus:border-sage"
        />
        <span className="mt-1 block text-xs text-sumi/60">
          地域コミュニティ機能でのみ使われます。住所や番地は入力しないでください。
        </span>
      </label>

      {/* Bio (任意) */}
      <label className="block text-sm font-semibold text-ink">
        自己紹介 (任意・200字以内)
        <textarea
          maxLength={200}
          rows={3}
          placeholder="どんな日常?どんなときに よりそい が必要?"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-2 block w-full resize-none rounded-2xl border border-wabi bg-white px-5 py-3 text-base text-ink outline-none placeholder:text-ink/30 focus:border-sage"
        />
        <span className="mt-1 block text-xs text-sumi/60">
          {bio.length} / 200
        </span>
      </label>

      {/* Agree */}
      <label className="flex cursor-pointer items-start gap-3 text-sm text-sumi">
        <input
          type="checkbox"
          required
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1 accent-sage"
        />
        <span>
          <a href="/legal/terms" className="text-sage underline" target="_blank" rel="noopener">
            利用規約
          </a>
          と
          <a href="/legal/privacy" className="text-sage underline" target="_blank" rel="noopener">
            プライバシーポリシー
          </a>
          に同意します
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending || !nickname || !role || !agree}
        className="w-full rounded-2xl bg-sage px-6 py-3 text-base font-semibold text-cream transition hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "登録中…" : "はじめる"}
      </button>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
