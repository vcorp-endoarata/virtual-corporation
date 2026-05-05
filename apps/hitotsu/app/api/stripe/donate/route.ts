import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const MIN_AMOUNT = 100;
const MAX_AMOUNT = 1_000_000;

/**
 * ひとつ への任意金額サポート決済 (ワンタイム)
 *
 * 税務上の整理:
 * - 「サポート/ご支援」表現で統一 (贈与扱いを避け、役務提供への対価=事業所得として処理)
 * - 1 トランザクション上限 ¥100 万 (¥110 万贈与税ラインに到達しない)
 * - Stripe metadata に kind=support を付与し、Dashboard で識別
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "リクエストの形式が正しくありません。" },
      { status: 400 },
    );
  }

  const rawAmount =
    body && typeof body === "object" && body !== null && "amount" in body
      ? (body as { amount: unknown }).amount
      : undefined;

  const amount =
    typeof rawAmount === "number"
      ? rawAmount
      : typeof rawAmount === "string"
        ? Number(rawAmount)
        : NaN;

  if (
    !Number.isFinite(amount) ||
    !Number.isInteger(amount) ||
    amount < MIN_AMOUNT ||
    amount > MAX_AMOUNT
  ) {
    return NextResponse.json(
      {
        error: "invalid_amount",
        message: `金額は ¥${MIN_AMOUNT.toLocaleString()} 〜 ¥${MAX_AMOUNT.toLocaleString()} の範囲で指定してください。`,
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hitotsu.v-corp.inc";

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "jpy",
          unit_amount: amount,
          product_data: {
            name: "ひとつ へのサポート",
            description: "サービス運営への任意のご支援",
          },
        },
        quantity: 1,
      },
    ],
    submit_type: "donate",
    metadata: {
      kind: "support",
      ...(user ? { supabase_user_id: user.id } : {}),
    },
    success_url: `${siteUrl}/support/thanks?amount=${amount}`,
    cancel_url: `${siteUrl}/support`,
    locale: "ja",
    ...(user?.email ? { customer_email: user.email } : {}),
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "session_failed", message: "決済画面の準備に失敗しました。" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
