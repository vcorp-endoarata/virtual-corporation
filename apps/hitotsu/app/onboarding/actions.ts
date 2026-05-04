"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MIN_LEN = 1;
const MAX_SITUATION = 1000;
const MAX_GOAL = 1000;
const MAX_DIFFICULTIES = 2000;
const ALLOWED_MINUTES = [15, 30, 60, 120, 180, 300] as const;

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentSituation = String(formData.get("current_situation") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  const dailyMinutesRaw = String(formData.get("daily_minutes") ?? "");
  const difficulties = String(formData.get("difficulties") ?? "").trim();

  const dailyMinutes = Number.parseInt(dailyMinutesRaw, 10);

  // 簡易バリデーション (詳細は DB の CHECK 制約でも担保)
  const errors: string[] = [];
  if (currentSituation.length < MIN_LEN) errors.push("current_situation_required");
  if (currentSituation.length > MAX_SITUATION) errors.push("current_situation_too_long");
  if (goal.length < MIN_LEN) errors.push("goal_required");
  if (goal.length > MAX_GOAL) errors.push("goal_too_long");
  if (!ALLOWED_MINUTES.includes(dailyMinutes as (typeof ALLOWED_MINUTES)[number])) {
    errors.push("daily_minutes_invalid");
  }
  if (difficulties.length > MAX_DIFFICULTIES) errors.push("difficulties_too_long");

  if (errors.length > 0) {
    redirect(`/onboarding?error=${encodeURIComponent(errors.join(","))}`);
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        current_situation: currentSituation,
        goal,
        daily_minutes: dailyMinutes,
        difficulties: difficulties || null,
        onboarding_completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app");
}
