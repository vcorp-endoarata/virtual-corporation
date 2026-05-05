import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import {
  getRecentTasks,
  getTodayTask,
  todayJst,
  type DailyTask,
} from "@/lib/today";
import { SubmitButton } from "@/components/submit-button";
import {
  completeTaskAction,
  generateTodayAction,
  uncompleteTaskAction,
} from "./today-actions";

export const metadata: Metadata = {
  title: "ダッシュボード — ひとつ",
};

type SearchParams = Promise<{ error?: string }>;

export default async function AppPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const [todayTask, recent] = await Promise.all([
    getTodayTask(user.id),
    getRecentTasks(user.id, 14),
  ]);

  const sp = await searchParams;
  const errorMsg = sp.error ? decodeURIComponent(sp.error) : null;

  // 今日以外の履歴のみを「最近のひとつ」として表示
  const today = todayJst();
  const history = recent.filter((t) => t.for_date !== today);

  return (
    <>
      <header className="mb-10">
        <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-2">
          {formatJstDate(today)}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-sage-900">
          今日のひとつ
        </h1>
      </header>

      {errorMsg && (
        <div className="mb-6 rounded-lg border border-sakura-300 bg-sakura-100 px-5 py-4 text-sm text-sage-800">
          エラー: {errorMsg}
        </div>
      )}

      {/* 今日のひとつ メインカード */}
      {todayTask ? (
        <TodayCard task={todayTask} />
      ) : (
        <GenerateCard />
      )}

      {/* 履歴 */}
      {history.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-5">
            最近のひとつ
          </h2>
          <ul className="space-y-3">
            {history.map((t) => (
              <li
                key={t.id}
                className="flex items-baseline gap-4 border-b border-cream-200 pb-3 last:border-b-0"
              >
                <span className="text-xs text-sage-400 tabular-nums whitespace-nowrap">
                  {formatJstDate(t.for_date, true)}
                </span>
                <span className="flex-1 text-sage-800 leading-[1.7]">
                  {t.title}
                </span>
                <span
                  className={`text-xs whitespace-nowrap ${
                    t.completed_at ? "text-sage-600" : "text-sage-300"
                  }`}
                >
                  {t.completed_at ? "✓ 完了" : "─"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 設定 */}
      <section className="mt-14 pt-8 border-t border-cream-200 flex items-center justify-between gap-4 text-sm">
        <span className="text-sage-400">登録した状況・目標</span>
        <Link
          href="/onboarding"
          className="text-sage-500 hover:text-sage-900 transition-colors underline"
        >
          編集する →
        </Link>
      </section>
    </>
  );
}

function GenerateCard() {
  return (
    <section className="border border-cream-300 rounded-xl p-7 bg-cream-50">
      <p className="text-sage-700 leading-[1.9] mb-6">
        まだ今日のひとつが決まっていません。
        <br />
        AI に決めてもらいましょう。
      </p>
      <form action={generateTodayAction}>
        <SubmitButton
          pendingText="AI が考えています..."
          className="w-full py-4 bg-sage-700 text-cream-50 rounded-lg font-medium hover:bg-sage-800"
        >
          今日のひとつを決める →
        </SubmitButton>
      </form>
      <p className="mt-4 text-xs text-sage-400 leading-[1.8]">
        AI (Claude) があなたの状況・目標・最近のタスク履歴をもとに、
        今日できる小さな 1 つを提案します。
      </p>
    </section>
  );
}

function TodayCard({ task }: { task: DailyTask }) {
  const completed = !!task.completed_at;

  return (
    <section
      className={`border rounded-xl p-7 transition-colors ${
        completed
          ? "border-sage-300 bg-sage-100"
          : "border-cream-300 bg-cream-50"
      }`}
    >
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase">
          今日のひとつ
        </p>
        <span className="text-xs text-sage-400 tabular-nums whitespace-nowrap">
          目安 {task.estimated_minutes} 分
        </span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-sage-900 leading-[1.45]">
        {task.title}
      </h2>

      {task.why && (
        <p className="mt-5 text-sage-700 leading-[1.9] text-[15px]">
          {task.why}
        </p>
      )}

      <div className="mt-7">
        {completed ? (
          <form action={uncompleteTaskAction}>
            <input type="hidden" name="task_id" value={task.id} />
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-sage-600">
                ✓ 完了しました ({formatTime(task.completed_at!)})
              </span>
              <SubmitButton
                spinner={false}
                pendingText="戻しています..."
                className="text-xs text-sage-500 hover:text-sage-900 underline"
              >
                やっぱり戻す
              </SubmitButton>
            </div>
          </form>
        ) : (
          <form action={completeTaskAction}>
            <input type="hidden" name="task_id" value={task.id} />
            <SubmitButton
              pendingText="記録中..."
              className="w-full py-4 bg-sage-700 text-cream-50 rounded-lg font-medium hover:bg-sage-800"
            >
              できた ✓
            </SubmitButton>
          </form>
        )}
      </div>
    </section>
  );
}

// -----------------------------------------------------------------
// 日付整形
// -----------------------------------------------------------------

const WEEK = ["日", "月", "火", "水", "木", "金", "土"] as const;

function formatJstDate(yyyymmdd: string, short = false): string {
  // yyyymmdd は "2026-05-04" 形式 (Asia/Tokyo の日付)
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = WEEK[date.getUTCDay()];
  if (short) return `${m}/${d} (${day})`;
  return `${y} 年 ${m} 月 ${d} 日 (${day})`;
}

function formatTime(isoString: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}
