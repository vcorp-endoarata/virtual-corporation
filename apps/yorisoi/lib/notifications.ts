import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailTemplates } from "@/lib/email";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yorisoi.community";

type EnqueueUnazukiParams = {
  recipientId: string;
  actorId: string;
  postId: string;
};

type EnqueueReplyParams = {
  recipientId: string;
  actorId: string;
  postId: string;
  replyId: string;
  replyBody: string;
};

/**
 * うなずき通知を作成し、必要に応じてメール送信。
 * 自分自身への通知はスキップ。
 * 重複 (同 actor → 同 post) は unique index で 1 件目以外無視。
 */
export async function enqueueUnazukiNotification(
  params: EnqueueUnazukiParams,
): Promise<void> {
  if (params.recipientId === params.actorId) return;

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("notifications")
    .insert({
      recipient_id: params.recipientId,
      actor_id: params.actorId,
      kind: "unazuki",
      post_id: params.postId,
    })
    .select("id")
    .maybeSingle();

  if (!existing) return; // 重複 (unique index で弾かれた)

  await maybeSendEmail({
    notificationId: existing.id,
    recipientId: params.recipientId,
    actorId: params.actorId,
    kind: "unazuki",
    postId: params.postId,
  });
}

/**
 * 返信通知を作成し、必要に応じてメール送信。
 */
export async function enqueueReplyNotification(
  params: EnqueueReplyParams,
): Promise<void> {
  if (params.recipientId === params.actorId) return;

  const admin = createAdminClient();

  const { data: created } = await admin
    .from("notifications")
    .insert({
      recipient_id: params.recipientId,
      actor_id: params.actorId,
      kind: "reply",
      post_id: params.postId,
      reply_id: params.replyId,
    })
    .select("id")
    .maybeSingle();

  if (!created) return;

  await maybeSendEmail({
    notificationId: created.id,
    recipientId: params.recipientId,
    actorId: params.actorId,
    kind: "reply",
    postId: params.postId,
    replyBody: params.replyBody,
  });
}

type MaybeSendEmailParams = {
  notificationId: string;
  recipientId: string;
  actorId: string;
  kind: "unazuki" | "reply";
  postId: string;
  replyBody?: string;
};

/**
 * recipient の通知設定をチェックして、realtime ならメール送信。
 * daily/weekly は将来のバッチで処理 (今は email_sent_at を null のまま放置)。
 */
async function maybeSendEmail(params: MaybeSendEmailParams): Promise<void> {
  const admin = createAdminClient();

  const { data: recipient } = await admin
    .from("profiles")
    .select(
      "nickname, notify_unazuki, notify_reply, notify_email_freq",
    )
    .eq("id", params.recipientId)
    .single();

  if (!recipient) return;

  // 種別ごとの通知設定チェック
  if (params.kind === "unazuki" && !recipient.notify_unazuki) return;
  if (params.kind === "reply" && !recipient.notify_reply) return;

  // realtime のみ即配信。daily/weekly/never は今は送らない
  if (recipient.notify_email_freq !== "realtime") return;

  // 受信者のメアド取得 (auth.users から)
  const { data: authUser } = await admin.auth.admin.getUserById(
    params.recipientId,
  );
  const email = authUser?.user?.email;
  if (!email) return;

  // 行動主の nickname を取得
  const { data: actor } = await admin
    .from("profiles")
    .select("nickname")
    .eq("id", params.actorId)
    .single();
  const actorName = actor?.nickname ?? "誰か";

  // 投稿本文 (unazuki 時のみ)
  let postBody = "";
  if (params.kind === "unazuki") {
    const { data: post } = await admin
      .from("posts")
      .select("body")
      .eq("id", params.postId)
      .single();
    postBody = post?.body ?? "";
  }

  const postUrl = `${SITE_URL}/post/${params.postId}`;

  const subject =
    params.kind === "unazuki"
      ? `${actorName} さんがうなずきました — よりそい`
      : `${actorName} さんが返信しました — よりそい`;

  const html =
    params.kind === "unazuki"
      ? emailTemplates.unazuki({ actorName, postBody, postUrl })
      : emailTemplates.reply({
          actorName,
          replyBody: params.replyBody ?? "",
          postUrl,
        });

  const result = await sendEmail({ to: email, subject, html });

  if (result.ok) {
    await admin
      .from("notifications")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", params.notificationId);
  }
  // result.skipped (RESEND_API_KEY 未設定) や result.error は無視
  // (DB に通知は残るので、後でメール再送可能)
}
