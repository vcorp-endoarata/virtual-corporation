import { createClient } from "./supabase/server";
import { isAdmin } from "./admin";

export type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getSubscription(
  userId: string,
): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getSubscription error", error);
    return null;
  }
  return data as Subscription | null;
}

/**
 * 「今 Pro として使える」状態か。
 * - admin メアドは常に true (運営者は無料で全機能利用)
 * - active / trialing は true
 * - それ以外は false
 */
export function isActive(
  sub: Subscription | null,
  email?: string | null,
): boolean {
  if (isAdmin(email)) return true;
  if (!sub) return false;
  return sub.status === "active" || sub.status === "trialing";
}

/** Pro として登録済 (期限切れでも DB 上は履歴が残る) */
export function hasEverSubscribed(sub: Subscription | null): boolean {
  return !!sub;
}
