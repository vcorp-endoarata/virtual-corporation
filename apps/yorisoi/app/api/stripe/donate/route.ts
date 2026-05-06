import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yorisoi.community";

// JPY: 100 円〜100 万円。Stripe JPY 最小は 50 円だが UX 上 100 円スタート。
const Body = z.object({
  amount: z.number().int().min(100).max(1_000_000),
});

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "決済機能はまだ準備中です。少々お待ちください。" },
      { status: 503 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "金額は 100 円〜1,000,000 円の範囲で指定してください" },
      { status: 400 },
    );
  }

  const stripe = getStripe();

  // ログイン中なら user_id を metadata に (匿名サポートも歓迎)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: "よりそい へのサポート",
              description:
                "サービス運営への任意のサポートです。ありがとうございます。",
            },
            unit_amount: parsed.data.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/support/thanks?amount=${parsed.data.amount}`,
      cancel_url: `${SITE_URL}/support`,
      locale: "ja",
      payment_method_types: ["card"],
      submit_type: "donate",
      customer_email: user?.email ?? undefined,
      metadata: {
        kind: "support",
        ...(user ? { user_id: user.id } : {}),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe donate] create session error:", err);
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
