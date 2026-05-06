import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getStripe,
  STRIPE_PRICE_ID,
  TRIAL_PERIOD_DAYS,
  isStripeConfigured,
} from "@/lib/stripe";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yorisoi.community";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "決済機能はまだ準備中です。少々お待ちください。" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const admin = createAdminClient();

  // 既存 subscription 取得 (Stripe customer の再利用)
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  // すでに有効なサブスクなら新規作成不要
  if (
    existing?.status &&
    ["trialing", "active"].includes(existing.status)
  ) {
    return NextResponse.json(
      { error: "既に有効なサブスクリプションがあります" },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  let customerId = existing?.stripe_customer_id;

  // Stripe Customer がまだ無ければ作成
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
        metadata: { user_id: user.id },
      },
      success_url: `${SITE_URL}/settings?subscription=success`,
      cancel_url: `${SITE_URL}/settings?subscription=cancelled`,
      locale: "ja",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      // 利用規約への同意 (特商法・規約合意)
      consent_collection: {
        terms_of_service: "required",
      },
      // カスタム文言 (規約 URL)
      custom_text: {
        terms_of_service_acceptance: {
          message: `[利用規約](${SITE_URL}/legal/terms) と [プライバシーポリシー](${SITE_URL}/legal/privacy) に同意します。`,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe checkout] create session error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "決済画面の作成に失敗しました",
      },
      { status: 500 },
    );
  }
}
