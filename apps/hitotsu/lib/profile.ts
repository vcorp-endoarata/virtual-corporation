import { createClient } from "./supabase/server";

export type Profile = {
  user_id: string;
  current_situation: string;
  goal: string;
  daily_minutes: number;
  difficulties: string | null;
  onboarding_completed_at: string;
  created_at: string;
  updated_at: string;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getProfile error", error);
    return null;
  }

  return data as Profile | null;
}
