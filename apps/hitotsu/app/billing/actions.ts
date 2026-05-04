"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, HITOTSU_PRICE_ID, HITOTSU_TRIAL_DAYS } from "@/lib/stripe";
import { getSubscription } from "@/lib/subscription";

/**
 * Checkout セッションを作成して Stripe へリダイレクト。
 * 既に Customer がいればそれを使い回し。なければ新規作成。
 */
export async function checkoutAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) redirect("/login");

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hitotsu.v-corp.inc";

  const stripe = getStripe();

  // 既存 customer 取得 (なければ作成)
  let customerId: string;
  const sub = await getSubscription(user.id);
  if (sub?.stripe_customer_id) {
    customerId = sub.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    // subscriptions レコードを先に作っておく (status incomplete)
    const admin = createAdminClient();
    await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        status: "incomplete",
      },
      { onConflict: "user_id" },
    );
  }

  // Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: HITOTSU_PRICE_ID, quantity: 1 }],
    subscription_data: {
      trial_period_days: HITOTSU_TRIAL_DAYS,
      metadata: { supabase_user_id: user.id },
    },
    success_url: `${siteUrl}/app?checkout=success`,
    cancel_url: `${siteUrl}/billing?checkout=canceled`,
    allow_promotion_codes: true,
    locale: "ja",
  });

  if (!session.url) {
    redirect("/billing?error=session_failed");
  }

  redirect(session.url);
}

/** Customer Portal で解約・支払い方法変更 */
export async function portalAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sub = await getSubscription(user.id);
  if (!sub?.stripe_customer_id) redirect("/billing");

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hitotsu.v-corp.inc";

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${siteUrl}/app`,
    locale: "ja",
  });

  redirect(session.url);
}
