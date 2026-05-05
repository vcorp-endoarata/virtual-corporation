"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isCodeValid, INVITE_REQUIRED } from "@/lib/invite";

const INVITE_COOKIE = "hitotsu_invite_code";
const INVITE_COOKIE_MAX_AGE = 60 * 30; // 30 分 (Magic Link 有効期間 60 分の余裕内)

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const inviteCode = String(formData.get("invite_code") ?? "").trim();

  if (!email || !email.includes("@")) {
    redirect("/login?error=invalid_email");
  }

  // 招待制が ON の場合、事前にコード検証
  // (admin の場合でもコード入力を求めるか? → スコープ簡素化のため求める)
  if (INVITE_REQUIRED) {
    if (!inviteCode) {
      redirect("/login?error=invite_code_required");
    }
    const valid = await isCodeValid(inviteCode);
    if (!valid) {
      redirect("/login?error=invite_code_invalid");
    }
    // cookie に保存 (callback でユーザー作成後に claim する)
    const cookieStore = await cookies();
    cookieStore.set(INVITE_COOKIE, inviteCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: INVITE_COOKIE_MAX_AGE,
    });
  }

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}
