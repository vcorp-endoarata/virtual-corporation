import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  clearInviteCookie,
  isInviteRequired,
  readInviteCookie,
  redeemInviteCode,
} from "@/lib/invite";

/**
 * Magic link / Email confirmation コールバック。
 *
 * Supabase Auth は project 設定によって2種類のフローを送る:
 *   - PKCE フロー  → ?code=xxx           → exchangeCodeForSession()
 *   - OTP フロー   → ?token_hash=xxx     → verifyOtp()
 *
 * α 版招待制 (INVITE_REQUIRED=true) のとき、新規ユーザーは
 * 招待コード cookie を必須とし、ここで原子的に redeem する。
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/feed";
  const origin = url.origin;

  // Supabase が error を URL params で返すケース (期限切れ等)
  const errorCode = url.searchParams.get("error_code");
  const errorDescription = url.searchParams.get("error_description");
  if (errorCode) {
    const msg =
      errorCode === "otp_expired"
        ? "ログインリンクの有効期限が切れています。もう一度お送りします。"
        : (errorDescription ?? errorCode);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(msg)}`,
    );
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as
        | "signup"
        | "magiclink"
        | "recovery"
        | "invite"
        | "email_change"
        | "email",
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
  } else {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  // 既存ユーザーは α 版でも素通し
  if (profile) {
    await clearInviteCookie();
    return NextResponse.redirect(`${origin}${next}`);
  }

  // ★ 新規ユーザー (profile なし) — α 版招待制チェック
  if (isInviteRequired()) {
    const inviteCode = await readInviteCookie();
    if (!inviteCode) {
      // 招待コードなしで新規アクセス → セッション破棄して error 表示
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
          "現在は招待制です。招待コードを入力するか、ウェイトリストにご登録ください。",
        )}`,
      );
    }

    // 原子的 redeem。失敗 (race lost or expired) なら sign out
    const result = await redeemInviteCode(inviteCode, user.id);
    await clearInviteCookie();
    if (!result.ok) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
          "招待コードが無効化されました。もう一度ご確認ください。",
        )}`,
      );
    }

    // ウェイトリスト経由なら waitlist 行も更新 (ベストエフォート、失敗しても続行)
    try {
      const admin = createAdminClient();
      await admin
        .from("waitlist")
        .update({
          invited_at: new Date().toISOString(),
          invite_code: inviteCode,
        })
        .eq("email", user.email ?? "")
        .is("invited_at", null);
    } catch {
      /* ignore */
    }
  }

  return NextResponse.redirect(`${origin}/onboarding`);
}
