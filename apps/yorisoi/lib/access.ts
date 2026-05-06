/**
 * 機能ゲーティング (有料制限) のヘルパー。
 *
 * 設計:
 * - ベータ期間中 (NEXT_PUBLIC_BETA_FREE_ACCESS=true): 全機能を全員無料開放
 * - ベータ終了後 (=false に変更): isPremium() が trialing/active のみ true を返し、
 *   各ページ/API で requirePremium() ガードが機能する
 *
 * 使い方:
 * - フィーチャー追加時: そのページ/API の最初で `await requirePremium()` を呼ぶ
 * - ベータ中はガードが no-op、ベータ終了後は自動で有料制限が効く
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BETA_FREE_ACCESS =
  (process.env.NEXT_PUBLIC_BETA_FREE_ACCESS ?? "true").toLowerCase() !== "false";

export type SubscriptionLike = {
  status?: string | null;
} | null;

/**
 * このサブスクは有料機能を使える状態か?
 * trialing (無料体験中) と active のみ premium 扱い。
 * BETA_FREE_ACCESS=true の間は常に true を返す。
 */
export function isPremium(subscription: SubscriptionLike): boolean {
  if (BETA_FREE_ACCESS) return true;
  if (!subscription?.status) return false;
  return subscription.status === "trialing" || subscription.status === "active";
}

export function isBetaPeriod(): boolean {
  return BETA_FREE_ACCESS;
}

/**
 * Server Component / API Route で使うガード関数。
 * 未ログインなら /login、サブスク必要なら /settings に redirect。
 *
 * Usage:
 *   await requirePremium();
 */
export async function requirePremium(): Promise<void> {
  if (BETA_FREE_ACCESS) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isPremium(sub)) {
    redirect("/settings?upgrade=required");
  }
}
