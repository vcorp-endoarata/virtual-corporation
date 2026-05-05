import { createAdminClient } from "./supabase/admin";

export type InviteCode = {
  code: string;
  product: "yorisoi" | "hitotsu" | "both";
  created_by: string | null;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  source: "manual" | "x_reply" | "waitlist" | "founder";
  note: string | null;
  created_at: string;
};

export type WaitlistEntry = {
  id: string;
  email: string;
  product: "yorisoi" | "hitotsu" | "both";
  source: "lp" | "login" | "x" | "referral" | "other";
  invited_at: string | null;
  invited_code: string | null;
  note: string | null;
  created_at: string;
};

export const INVITE_REQUIRED =
  process.env.INVITE_REQUIRED === "true";

const CODE_PREFIX = "hitotsu-";

/**
 * 招待コードの形式バリデーション (DB 問い合わせ前の事前チェック)
 * 形式: hitotsu-{8文字英数小文字}
 */
export function isValidCodeFormat(code: string): boolean {
  return /^hitotsu-[a-z0-9]{8}$/.test(code);
}

/**
 * 招待コードを生成 (英数小文字 8 文字)
 */
export function generateCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${CODE_PREFIX}${suffix}`;
}

/**
 * 招待コードが有効か検証 (RLS バイパス、未使用 + 期限切れでない)
 * INVITE_REQUIRED=false の時は常に true を返す
 */
export async function isCodeValid(code: string): Promise<boolean> {
  if (!INVITE_REQUIRED) return true;
  if (!isValidCodeFormat(code)) return false;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invite_codes")
    .select("code, used_at, expires_at, product")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) return false;
  if (data.used_at) return false;
  if (data.expires_at && new Date(data.expires_at) <= new Date()) return false;
  if (data.product !== "hitotsu" && data.product !== "both") return false;
  return true;
}

/**
 * 招待コードを「使用済」にマーク (auth callback 後の初回ログインで呼ぶ)
 * 既に used_by が入っていたら no-op (race condition 安全)
 */
export async function claimCode(code: string, userId: string): Promise<void> {
  if (!isValidCodeFormat(code)) return;

  const supabase = createAdminClient();
  await supabase
    .from("invite_codes")
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq("code", code)
    .is("used_at", null);
}

// -----------------------------------------------------------------
// Admin 用ヘルパ
// -----------------------------------------------------------------

/**
 * 新しい招待コードを発行 (重複したら最大 5 回までリトライ)
 */
export async function issueCode(opts: {
  createdBy?: string;
  source?: InviteCode["source"];
  note?: string;
  expiresAt?: string;
}): Promise<InviteCode | null> {
  const supabase = createAdminClient();
  for (let i = 0; i < 5; i++) {
    const code = generateCode();
    const { data, error } = await supabase
      .from("invite_codes")
      .insert({
        code,
        product: "hitotsu",
        created_by: opts.createdBy ?? null,
        source: opts.source ?? "manual",
        note: opts.note ?? null,
        expires_at: opts.expiresAt ?? null,
      })
      .select()
      .single();
    if (!error && data) return data as InviteCode;
  }
  return null;
}

/**
 * 招待コード一覧 (新しい順)
 */
export async function listCodes(limit = 50): Promise<InviteCode[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("invite_codes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as InviteCode[];
}

/**
 * ウェイトリスト (未招待) を古い順 (FIFO)
 */
export async function listWaitlist(opts?: {
  uninvitedOnly?: boolean;
  limit?: number;
}): Promise<WaitlistEntry[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(opts?.limit ?? 100);
  if (opts?.uninvitedOnly) {
    query = query.is("invited_at", null);
  }
  const { data } = await query;
  return (data ?? []) as WaitlistEntry[];
}

/**
 * ウェイトリストにメアドを追加 (重複は無視 = upsert)
 */
export async function addToWaitlist(
  email: string,
  source: WaitlistEntry["source"] = "lp",
): Promise<{ ok: boolean; error?: string }> {
  if (!email || !email.includes("@")) {
    return { ok: false, error: "invalid_email" };
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("waitlist").upsert(
    {
      email: email.trim().toLowerCase(),
      product: "hitotsu",
      source,
    },
    { onConflict: "email,product", ignoreDuplicates: true },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * 1 件を招待 (コード発行 + ウェイトリストに紐付け + メール送信は呼出元)
 * 戻り値: 発行したコード
 */
export async function inviteWaitlistEntry(
  entryId: string,
): Promise<{ entry: WaitlistEntry; code: InviteCode } | null> {
  const supabase = createAdminClient();
  const code = await issueCode({ source: "waitlist" });
  if (!code) return null;

  const { data: entry, error } = await supabase
    .from("waitlist")
    .update({
      invited_at: new Date().toISOString(),
      invited_code: code.code,
    })
    .eq("id", entryId)
    .select()
    .single();
  if (error || !entry) return null;
  return { entry: entry as WaitlistEntry, code };
}
