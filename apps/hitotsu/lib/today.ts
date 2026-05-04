import { createClient } from "./supabase/server";
import { getAnthropic, HITOTSU_MODEL } from "./anthropic";
import type { Profile } from "./profile";

export type DailyTask = {
  id: string;
  user_id: string;
  title: string;
  why: string | null;
  estimated_minutes: number;
  for_date: string; // YYYY-MM-DD (Asia/Tokyo)
  completed_at: string | null;
  generated_at: string;
  created_at: string;
};

/** Asia/Tokyo の今日の日付を YYYY-MM-DD で返す */
export function todayJst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function getTodayTask(userId: string): Promise<DailyTask | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("for_date", todayJst())
    .maybeSingle();

  if (error) {
    console.error("getTodayTask error", error);
    return null;
  }
  return data as DailyTask | null;
}

export async function getRecentTasks(
  userId: string,
  limit = 7,
): Promise<DailyTask[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("for_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentTasks error", error);
    return [];
  }
  return (data as DailyTask[]) ?? [];
}

/**
 * 「今日のひとつ」を AI で生成して保存。
 * 既に今日の分があれば再利用 (重複生成しない)。
 */
export async function generateTodayTask(
  userId: string,
  profile: Profile,
): Promise<{ task: DailyTask | null; error?: string }> {
  const existing = await getTodayTask(userId);
  if (existing) {
    return { task: existing };
  }

  const recent = await getRecentTasks(userId, 7);

  let parsed: { title: string; why: string; estimated_minutes: number };
  try {
    parsed = await callAnthropic(profile, recent);
  } catch (e) {
    console.error("anthropic call failed", e);
    return {
      task: null,
      error:
        e instanceof Error ? e.message : "AI 呼び出しでエラーが発生しました",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_tasks")
    .insert({
      user_id: userId,
      for_date: todayJst(),
      title: parsed.title,
      why: parsed.why,
      estimated_minutes: parsed.estimated_minutes,
    })
    .select("*")
    .single();

  if (error) {
    console.error("daily_tasks insert error", error);
    return { task: null, error: error.message };
  }

  return { task: data as DailyTask };
}

export async function completeTodayTask(
  userId: string,
  taskId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_tasks")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("user_id", userId)
    .is("completed_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function uncompleteTodayTask(
  userId: string,
  taskId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_tasks")
    .update({ completed_at: null })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// -----------------------------------------------------------------
// Anthropic 呼び出し
// -----------------------------------------------------------------

const SYSTEM_PROMPT = `あなたはユーザーの「今日やる 1 つだけ」を決める静かな伴走者です。
ユーザーは留年・不登校・通信制・発達特性などの背景で「何から手を付けるか」が固まりやすい人。

以下のルールを必ず守ってください:

1. **1 つだけ提案する**。複数候補や段階分けはしない。
2. **行動可能で具体的**。「数学を勉強する」ではなく「数学の問題集 p.40 を 5 問だけ解く」のように、最初の一歩が明確であること。
3. **時間は短めに**。ユーザーが申告した「1 日に使える時間」の **半分以下** を目安にする。
4. **心理的ハードルが低い**こと。完璧主義を煎らない。失敗を前提に書く。
5. **過去のタスクと完全重複しない**。少しずつ変化をつける。
6. トーンは **励ますがおだてない**。「今日もえらい」「すごい」のような褐め言葉は不要。
7. **JSON のみ出力**。前後に説明やマークダウンは書かない:

{
  "title": "今日のタスク (20 字以内推奨、命令形ではなく宣言形で)",
  "why": "なぜ今日これをやるのか + そっと寄り添う一言 (合わせて 80 字以内、敬語)",
  "estimated_minutes": 整数 (5-60)
}`;

async function callAnthropic(
  profile: Profile,
  recent: DailyTask[],
): Promise<{ title: string; why: string; estimated_minutes: number }> {
  const recentText =
    recent.length === 0
      ? "(まだなし。今日が初めてのタスクです)"
      : recent
          .map(
            (t) =>
              `- ${t.for_date}: 「${t.title}」(${t.completed_at ? "完了" : "未完了"})`,
          )
          .join("\n");

  const userPrompt = `【ユーザーの状況】
${profile.current_situation}

【達成したい目標】
${profile.goal}

【1 日に使える時間】
${profile.daily_minutes} 分

【苦手・困りごと】
${profile.difficulties || "(特になし)"}

【最近のタスク履歴】
${recentText}

上記を踏まえて、今日の 1 つだけのタスクを JSON で出してください。`;

  const anthropic = getAnthropic();
  const response = await anthropic.messages.create({
    model: HITOTSU_MODEL,
    max_tokens: 400,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const parsed = parseTaskJson(text);
  if (!parsed) {
    throw new Error(`AI 応答を解析できませんでした: ${text.slice(0, 200)}`);
  }
  return parsed;
}

function parseTaskJson(
  text: string,
): { title: string; why: string; estimated_minutes: number } | null {
  // JSON ブロックを抽出 (前後の余計な文字に対する保険)
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]) as Record<string, unknown>;
    if (typeof obj.title !== "string") return null;
    if (typeof obj.estimated_minutes !== "number") return null;
    return {
      title: obj.title.trim().slice(0, 200),
      why: typeof obj.why === "string" ? obj.why.trim().slice(0, 500) : "",
      estimated_minutes: Math.max(
        5,
        Math.min(120, Math.round(obj.estimated_minutes)),
      ),
    };
  } catch {
    return null;
  }
}

// 型用 import (循環参照を避けるため最後に)
import type Anthropic from "@anthropic-ai/sdk";
