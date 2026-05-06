import Stripe from "stripe";

/**
 * Server-only Stripe client (lazy init).
 * STRIPE_SECRET_KEY が未設定でも build 時に crash しないよう、
 * 実際のリクエストで getStripe() を呼んだ時に初期化される。
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  _stripe = new Stripe(key, { typescript: true });
  return _stripe;
}

export const STRIPE_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? "";

/** 14日間の無料トライアル */
export const TRIAL_PERIOD_DAYS = 14;

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
  );
}
