import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

export const INVITE_COOKIE = "yorisoi_invite";
export const INVITE_COOKIE_MAX_AGE = 60 * 5; // 5 分

export function isInviteRequired(): boolean {
  return process.env.INVITE_REQUIRED === "true";
}

/**
 * 招待コード生成 (yorisoi-xxxxxxxx 形式、英数小文字 8桁)。
 * 仕様: 衝突確率は 36^8 ≈ 2.8兆。実用上ほぼ衝突しない。
 */
export function generateInviteCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (let i = 0; i < 8; i++) {
    s += chars[bytes[i] % chars.length];
  }
  return `yorisoi-${s}`;
}

export type InviteCheckResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "already_used" | "expired" };

/**
 * 招待コードの状態確認 (read-only)。redeem は別関数で原子的に行う。
 */
export async function checkInviteCode(
  supabase: SupabaseClient,
  code: string,
): Promise<InviteCheckResult> {
  const { data } = await supabase
    .from("invite_codes")
    .select("code, used_by, used_at, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (!data) return { ok: false, reason: "not_found" };
  if (data.used_by) return { ok: false, reason: "already_used" };
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true };
}

/**
 * 招待コードを atomic に redeem。race condition を防ぐため
 * UPDATE ... WHERE used_by IS NULL で 0 行更新なら失敗扱い。
 */
export async function redeemInviteCode(
  code: string,
  userId: string,
): Promise<{ ok: boolean }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invite_codes")
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq("code", code)
    .is("used_by", null)
    .select("code")
    .maybeSingle();
  if (error || !data) return { ok: false };
  return { ok: true };
}

export async function setInviteCookie(code: string) {
  const store = await cookies();
  store.set(INVITE_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: INVITE_COOKIE_MAX_AGE,
  });
}

export async function readInviteCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(INVITE_COOKIE)?.value ?? null;
}

export async function clearInviteCookie() {
  const store = await cookies();
  store.delete(INVITE_COOKIE);
}
