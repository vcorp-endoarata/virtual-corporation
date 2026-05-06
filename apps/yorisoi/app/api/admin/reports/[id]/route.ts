import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const Body = z.object({
  action: z.enum([
    "dismiss",
    "hide_post",
    "delete_post",
    "warn_user",
    "suspend_user_24h",
    "suspend_user_7d",
    "ban_user",
  ]),
  note: z.string().max(2000).nullable().optional(),
});

const SUSPEND_HOURS: Record<string, number | null> = {
  suspend_user_24h: 24,
  suspend_user_7d: 24 * 7,
  ban_user: null, // permanent
};

const ACTION_TO_LOG: Record<string, string> = {
  dismiss: "post_hidden", // dismiss は記録不要だが statement のため
  hide_post: "post_hidden",
  delete_post: "post_deleted",
  warn_user: "user_warned",
  suspend_user_24h: "user_suspended",
  suspend_user_7d: "user_suspended",
  ban_user: "user_banned",
};

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (res) {
    if (res instanceof Response) return res;
    throw res;
  }

  const { id: reportId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "不正な入力です" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 対象 report 取得
  const { data: report } = await admin
    .from("reports")
    .select("id, target_type, target_id, status")
    .eq("id", reportId)
    .single();

  if (!report) {
    return NextResponse.json({ error: "通報が見つかりません" }, { status: 404 });
  }

  const { action, note } = parsed.data;

  // dismiss: report のみ resolved 化
  if (action === "dismiss") {
    await admin
      .from("reports")
      .update({
        status: "dismissed",
        resolved_by: actor.userId,
        resolution_note: note,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", reportId);
    return NextResponse.json({ ok: true });
  }

  // post 系アクション
  if (action === "hide_post" || action === "delete_post") {
    if (report.target_type !== "post") {
      return NextResponse.json(
        { error: "投稿に対するアクションです" },
        { status: 400 },
      );
    }
    const newStatus = action === "hide_post" ? "hidden" : "deleted";
    await admin
      .from("posts")
      .update({ status: newStatus })
      .eq("id", report.target_id);

    await admin.from("moderation_actions").insert({
      actor_id: actor.userId,
      target_post_id: report.target_id,
      related_report_id: reportId,
      action_type: action === "hide_post" ? "post_hidden" : "post_deleted",
      reason: note ?? "通報対応",
    });
  }

  // user 系アクション
  if (
    action === "warn_user" ||
    action === "suspend_user_24h" ||
    action === "suspend_user_7d" ||
    action === "ban_user"
  ) {
    // 対象 user_id 解決 (post から author を取得 or 直接 target_id)
    let targetUserId: string | null = null;
    if (report.target_type === "user") {
      targetUserId = report.target_id;
    } else if (report.target_type === "post") {
      const { data: p } = await admin
        .from("posts")
        .select("author_id")
        .eq("id", report.target_id)
        .single();
      targetUserId = p?.author_id ?? null;
    }
    if (!targetUserId) {
      return NextResponse.json(
        { error: "対象ユーザーが特定できません" },
        { status: 400 },
      );
    }

    if (action !== "warn_user") {
      const hours = SUSPEND_HOURS[action];
      const banUntil =
        hours === null
          ? new Date("9999-12-31T23:59:59Z") // 永久 BAN
          : new Date(Date.now() + hours * 3600 * 1000);
      await admin
        .from("profiles")
        .update({ ban_until: banUntil.toISOString() })
        .eq("id", targetUserId);
    }

    await admin.from("moderation_actions").insert({
      actor_id: actor.userId,
      target_user_id: targetUserId,
      related_report_id: reportId,
      action_type: ACTION_TO_LOG[action] ?? "user_warned",
      reason: note ?? "通報対応",
      duration_hours: SUSPEND_HOURS[action] ?? null,
    });
  }

  // report を resolved_action に更新
  await admin
    .from("reports")
    .update({
      status: "resolved_action",
      resolved_by: actor.userId,
      resolution_note: note,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  return NextResponse.json({ ok: true });
}
