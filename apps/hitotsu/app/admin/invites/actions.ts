"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import {
  inviteWaitlistEntry,
  issueCode,
} from "@/lib/invite";
import { inviteEmailHtml, sendEmail } from "@/lib/email";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    redirect("/login");
  }
  return user;
}

/**
 * 手動でコードを発行 (X リプライ向けなど)
 * source は "manual" / "x_reply" / "founder" のいずれか
 */
export async function generateCodeAction(formData: FormData) {
  const user = await requireAdmin();
  const sourceRaw = String(formData.get("source") ?? "manual");
  const note = String(formData.get("note") ?? "").trim() || null;
  const source = (
    ["manual", "x_reply", "founder"] as const
  ).includes(sourceRaw as never)
    ? (sourceRaw as "manual" | "x_reply" | "founder")
    : "manual";

  await issueCode({
    createdBy: user.id,
    source,
    note: note ?? undefined,
  });
  revalidatePath("/admin/invites");
}

/**
 * ウェイトリスト 1 件を招待 (コード発行 + 紐付け + メール送信)
 */
export async function inviteEntryAction(formData: FormData) {
  await requireAdmin();
  const entryId = String(formData.get("entry_id") ?? "").trim();
  if (!entryId) return;

  const result = await inviteWaitlistEntry(entryId);
  if (!result) {
    redirect("/admin/invites?error=invite_failed");
  }

  // メール送信 (失敗してもサイレントに続行、admin は管理画面で確認可能)
  await sendEmail({
    to: result.entry.email,
    subject: "【ひとつ】α版へのご招待です",
    html: inviteEmailHtml({ code: result.code.code }),
  });

  revalidatePath("/admin/invites");
  redirect(`/admin/invites?invited=${encodeURIComponent(result.entry.email)}`);
}

/**
 * バッチ招待 (ウェイトリストの古い順から N 件)
 */
export async function batchInviteAction(formData: FormData) {
  await requireAdmin();
  const countRaw = Number(formData.get("count") ?? "5");
  const count = Number.isInteger(countRaw) && countRaw > 0 && countRaw <= 50
    ? countRaw
    : 5;

  const { listWaitlist } = await import("@/lib/invite");
  const entries = await listWaitlist({ uninvitedOnly: true, limit: count });

  let successCount = 0;
  for (const entry of entries) {
    const result = await inviteWaitlistEntry(entry.id);
    if (!result) continue;
    const sent = await sendEmail({
      to: result.entry.email,
      subject: "【ひとつ】α版へのご招待です",
      html: inviteEmailHtml({ code: result.code.code }),
    });
    if (sent.ok) successCount++;
  }

  revalidatePath("/admin/invites");
  redirect(`/admin/invites?batch=${successCount}`);
}
