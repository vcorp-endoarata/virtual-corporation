import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { claimCode } from "@/lib/invite";

const INVITE_COOKIE = "hitotsu_invite_code";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // Supabase auth callback は 2 種類のフローがある:
  // - PKCE: ?code=xxx (exchangeCodeForSession)
  // - OTP: ?token_hash=xxx&type=magiclink (verifyOtp)
  // どちらも対応する。
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "signup"
    | "magiclink"
    | "recovery"
    | "invite"
    | "email_change"
    | null;
  const next = searchParams.get("next") ?? "/app";

  const supabase = await createClient();

  let userId: string | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
    userId = data.user?.id ?? null;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
    userId = data.user?.id ?? null;
  } else {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("invalid_callback")}`,
    );
  }

  // 招待コード cookie があれば claim (初回ログインのみ事実上使われる、再ログイン時は no-op)
  if (userId) {
    const cookieStore = await cookies();
    const inviteCookie = cookieStore.get(INVITE_COOKIE);
    if (inviteCookie?.value) {
      await claimCode(inviteCookie.value, userId);
      cookieStore.delete(INVITE_COOKIE);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
