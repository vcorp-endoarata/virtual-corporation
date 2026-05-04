/**
 * 管理者 (運営者) 判定。
 * 環境変数 ADMIN_EMAILS (カンマ区切り) に含まれるメアドを admin として扱う。
 * admin はサブスクリプション無関係に全機能を利用可。
 */
export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}
