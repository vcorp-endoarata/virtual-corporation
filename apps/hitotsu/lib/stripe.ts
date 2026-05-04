import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/** ひとつ プラン (¥1,480/月、7 日無料試用) */
export const HITOTSU_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? "";
export const HITOTSU_TRIAL_DAYS = 7;
