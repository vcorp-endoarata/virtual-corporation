import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "ダッシュボード — ひとつ",
};

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-sage-900">
        ようこそ
      </h1>
      <p className="mt-3 text-sage-500">
        ログイン中: <span className="text-sage-800">{user.email}</span>
      </p>

      <section className="mt-12 border border-cream-300 rounded-xl p-7">
        <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
          Day 2: オンボーディング ✅
        </p>
        <p className="text-sage-800 leading-[1.8]">
          あなたの状況を受け取りました。
          <br />
          AI が「今日のひとつ」を生成する機能は次のステップで追加されます。
        </p>
      </section>

      <section className="mt-8 border border-cream-300 rounded-xl p-7">
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase">
            登録した内容
          </p>
          <Link
            href="/onboarding"
            className="text-xs text-sage-500 hover:text-sage-900 transition-colors underline"
          >
            編集
          </Link>
        </div>
        <dl className="space-y-5">
          <Row label="現在の状況" value={profile.current_situation} />
          <Row label="目標" value={profile.goal} />
          <Row label="1日の使える時間" value={`${formatMinutes(profile.daily_minutes)}`} />
          {profile.difficulties && (
            <Row label="苦手・困りごと" value={profile.difficulties} />
          )}
        </dl>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.2em] text-sage-400 uppercase mb-1.5">
        {label}
      </dt>
      <dd className="text-sage-800 leading-[1.8] whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} 分`;
  if (min === 60) return "1 時間";
  if (min % 60 === 0) return `${min / 60} 時間`;
  return `${Math.floor(min / 60)} 時間 ${min % 60} 分`;
}
