import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { saveOnboarding } from "./actions";

export const metadata: Metadata = {
  title: "はじめに教えてください — ひとつ",
  description: "あなたの現状と目標を教えてください。AI が毎日の 1 つを決めるために使います。",
};

type SearchParams = Promise<{ error?: string }>;

const TIME_OPTIONS = [
  { value: 15, label: "15 分" },
  { value: 30, label: "30 分" },
  { value: 60, label: "1 時間" },
  { value: 120, label: "2 時間" },
  { value: 180, label: "3 時間" },
  { value: 300, label: "5 時間以上" },
] as const;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 既存 profile を初期値に (編集も同じページで)
  const profile = await getProfile(user.id);

  const sp = await searchParams;
  const errors = sp.error?.split(",") ?? [];
  const errMsg = (key: string) => translateError(key);

  return (
    <main className="min-h-screen px-6 py-16 sm:px-12 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12">
          <Link
            href="/"
            className="text-xs tracking-[0.3em] text-sakura-300 uppercase hover:text-sage-700 transition-colors"
          >
            ← ひとつ
          </Link>
          <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight text-sage-900">
            はじめに
            <br />
            教えてください
          </h1>
          <p className="mt-5 text-sage-500 leading-[1.9]">
            AI が「今日やる 1 つだけ」を決めるために使います。
            <br />
            完璧じゃなくて大丈夫。あとで何度でも書き直せます。
          </p>
        </header>

        {errors.length > 0 && (
          <div className="mb-8 rounded-lg border border-sakura-300 bg-sakura-100 px-5 py-4">
            <p className="text-sm font-medium text-sage-900 mb-1">入力に確認が必要です</p>
            <ul className="text-sm text-sage-700 space-y-0.5 list-disc pl-5">
              {errors.map((e) => (
                <li key={e}>{errMsg(e)}</li>
              ))}
            </ul>
          </div>
        )}

        <form action={saveOnboarding} className="space-y-10">
          {/* 現状 */}
          <Field
            label="現在の状況"
            hint="例: 高校 3 年で留年中、単位が足りていない / 通信制で自分のペースで進めたい / 不登校気味で何から手をつけるか分からない"
          >
            <textarea
              name="current_situation"
              required
              rows={4}
              maxLength={1000}
              defaultValue={profile?.current_situation ?? ""}
              placeholder="一番伝えたいことを 1-3 行で。"
              className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-lg text-sage-900 placeholder-sage-300 focus:outline-none focus:border-sage-500 transition-colors resize-y leading-[1.8]"
            />
          </Field>

          {/* 目標 */}
          <Field
            label="達成したい目標"
            hint="例: 卒業したい / 大検 (高卒認定) を取りたい / 自分のペースで毎日少しずつ進めたい"
          >
            <textarea
              name="goal"
              required
              rows={3}
              maxLength={1000}
              defaultValue={profile?.goal ?? ""}
              placeholder="ふんわりした願望でも OK。"
              className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-lg text-sage-900 placeholder-sage-300 focus:outline-none focus:border-sage-500 transition-colors resize-y leading-[1.8]"
            />
          </Field>

          {/* 1 日に使える時間 */}
          <Field
            label="1 日に使える時間"
            hint="平均でこのくらい使える、という時間を選んでください。多すぎる目安にしないのがコツです。"
          >
            <div className="grid grid-cols-3 gap-3">
              {TIME_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="cursor-pointer flex items-center justify-center px-4 py-3 bg-cream-50 border border-cream-300 rounded-lg text-sage-700 has-checked:bg-sage-700 has-checked:text-cream-50 has-checked:border-sage-700 transition-colors text-sm font-medium"
                >
                  <input
                    type="radio"
                    name="daily_minutes"
                    value={opt.value}
                    required
                    defaultChecked={
                      profile
                        ? profile.daily_minutes === opt.value
                        : opt.value === 30
                    }
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </Field>

          {/* 苦手・困りごと (任意) */}
          <Field
            label="苦手なこと・困っていること"
            optional
            hint="例: 朝起きられない / 数学が壊滅的 / 集中が 10 分しか続かない / トゥレットのチックで字が書きづらい"
          >
            <textarea
              name="difficulties"
              rows={4}
              maxLength={2000}
              defaultValue={profile?.difficulties ?? ""}
              placeholder="思いつくまま書いて OK。空欄でも大丈夫。"
              className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-lg text-sage-900 placeholder-sage-300 focus:outline-none focus:border-sage-500 transition-colors resize-y leading-[1.8]"
            />
          </Field>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-sage-700 text-cream-50 rounded-lg font-medium hover:bg-sage-800 transition-colors"
            >
              {profile ? "保存する" : "これで「今日のひとつ」を始める →"}
            </button>
            <p className="mt-4 text-xs text-sage-400 leading-[1.8] text-center">
              入力内容は後から自由に変更できます。
              <br />
              当方の{" "}
              <a
                href="https://v-corp.inc/legal/privacy"
                className="underline hover:text-sage-700"
                target="_blank"
                rel="noreferrer"
              >
                プライバシーポリシー
              </a>{" "}
              のとおり安全に取り扱います。
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-xs tracking-[0.2em] text-sakura-300 uppercase">
          {label}
        </span>
        {optional && (
          <span className="text-[10px] tracking-widest text-sage-400 uppercase">
            任意
          </span>
        )}
      </label>
      {hint && <p className="mb-3 text-xs text-sage-400 leading-[1.8]">{hint}</p>}
      {children}
    </div>
  );
}

function translateError(key: string): string {
  const map: Record<string, string> = {
    current_situation_required: "現在の状況を入力してください。",
    current_situation_too_long: "現在の状況は 1000 文字以内で入力してください。",
    goal_required: "達成したい目標を入力してください。",
    goal_too_long: "目標は 1000 文字以内で入力してください。",
    daily_minutes_invalid: "1 日に使える時間を選択してください。",
    difficulties_too_long: "苦手・困りごとは 2000 文字以内で入力してください。",
  };
  return map[key] ?? key;
}
