import type { SupabaseClient } from "@supabase/supabase-js";

export const TRIAL_DURATION_HOURS = 24;
export const TRIAL_MAX_POSTS = 5;

export type TrialStatus = {
  isTrial: boolean;
  hoursLeft: number;
  postsInWindow: number;
  postsRemaining: number;
  mediaAllowed: boolean;
};

/**
 * 新規ユーザーの保護期間 (登録から 24 時間) は:
 * - 24 時間以内に最大 5 投稿まで
 * - 写真/動画の投稿不可
 * - うなずき・返信は無制限 (まずは読むことを促す)
 *
 * スパムボット対策と、コミュニティへの優しい態らしの 2 つを兼ねる。
 */
export async function getTrialStatus(
  supabase: SupabaseClient,
  userId: string,
  profileCreatedAt: string,
): Promise<TrialStatus> {
  const ageHours =
    (Date.now() - new Date(profileCreatedAt).getTime()) / (1000 * 60 * 60);
  const isTrial = ageHours < TRIAL_DURATION_HOURS;

  if (!isTrial) {
    return {
      isTrial: false,
      hoursLeft: 0,
      postsInWindow: 0,
      postsRemaining: Number.POSITIVE_INFINITY,
      mediaAllowed: true,
    };
  }

  const since = new Date(
    Date.now() - TRIAL_DURATION_HOURS * 3600 * 1000,
  ).toISOString();

  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("created_at", since);

  const postsInWindow = count ?? 0;
  return {
    isTrial: true,
    hoursLeft: Math.max(0, Math.ceil(TRIAL_DURATION_HOURS - ageHours)),
    postsInWindow,
    postsRemaining: Math.max(0, TRIAL_MAX_POSTS - postsInWindow),
    mediaAllowed: false,
  };
}
