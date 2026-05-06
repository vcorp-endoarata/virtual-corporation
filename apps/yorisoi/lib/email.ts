/**
 * Resend API 経由でメール送信。
 * RESEND_API_KEY が未設定の場合は graceful skip (落ちない)。
 */

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(
  params: SendEmailParams,
): Promise<{ ok: boolean; error?: string; skipped?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, skipped: true };
  }

  const from = process.env.EMAIL_FROM ?? "よりそい <hello@send.yorisoi.community>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text ?? stripHtml(params.html),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${detail}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yorisoi.community";

const EMAIL_LAYOUT = (title: string, body: string) => `
<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #fdfaf3; color: #2d2a26; padding: 32px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px;">
    <h1 style="font-size: 20px; color: #5a7e5a; margin: 0 0 16px;">よりそい</h1>
    <p style="font-size: 16px; line-height: 1.7;">${title}</p>
    <div style="margin: 24px 0; padding: 16px; background: #fdfaf3; border-radius: 12px; font-size: 14px; line-height: 1.6;">
      ${body}
    </div>
    <hr style="border: none; border-top: 1px solid #e6e0d4; margin: 24px 0;">
    <p style="font-size: 11px; color: #8a857d; line-height: 1.6;">
      このメールは ${SITE_URL} の通知設定に基づいて送信されています。<br>
      通知を受け取らない場合は <a href="${SITE_URL}/settings" style="color: #5a7e5a;">設定</a> から変更できます。
    </p>
  </div>
</body></html>
`;

export const emailTemplates = {
  unazuki: ({
    actorName,
    postBody,
    postUrl,
  }: {
    actorName: string;
    postBody: string;
    postUrl: string;
  }) =>
    EMAIL_LAYOUT(
      `<strong>${actorName}</strong> さんが、あなたの投稿にうなずきました 🌿`,
      `<p style="margin: 0 0 16px;">「${escapeHtml(postBody.slice(0, 120))}${
        postBody.length > 120 ? "…" : ""
      }」</p>
       <a href="${postUrl}" style="display: inline-block; background: #5a7e5a; color: #fdfaf3; padding: 10px 20px; border-radius: 999px; text-decoration: none; font-size: 13px;">投稿を見る →</a>`,
    ),

  reply: ({
    actorName,
    replyBody,
    postUrl,
  }: {
    actorName: string;
    replyBody: string;
    postUrl: string;
  }) =>
    EMAIL_LAYOUT(
      `<strong>${actorName}</strong> さんが、あなたの投稿に返信しました 💬`,
      `<p style="margin: 0 0 16px;">「${escapeHtml(replyBody.slice(0, 200))}${
        replyBody.length > 200 ? "…" : ""
      }」</p>
       <a href="${postUrl}" style="display: inline-block; background: #5a7e5a; color: #fdfaf3; padding: 10px 20px; border-radius: 999px; text-decoration: none; font-size: 13px;">返信を見る →</a>`,
    ),

  invite: ({ code }: { code: string }) =>
    EMAIL_LAYOUT(
      `🌱 <strong>よりそい α 版</strong> へのご招待です`,
      `<p style="margin: 0 0 16px; line-height: 1.8;">
         お待たせしました。「よりそい」 α 版にご招待いたします。<br>
         発達障害の当事者と、家族・身近な人が、評価のない場所で
         ゆっくり寄り添い合えるコミュニティです。
       </p>
       <p style="margin: 0 0 8px;">あなたの招待コード:</p>
       <p style="margin: 0 0 20px; padding: 12px 16px; background: #fdfaf3; border: 1px dashed #5a7e5a; border-radius: 8px; font-family: monospace; font-size: 16px; color: #2d2a26; text-align: center; letter-spacing: 0.05em;">
         <strong>${escapeHtml(code)}</strong>
       </p>
       <a href="${SITE_URL}/login" style="display: inline-block; background: #5a7e5a; color: #fdfaf3; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 600;">ログインして始める →</a>
       <p style="margin: 20px 0 0; font-size: 12px; color: #8a857d; line-height: 1.7;">
         ログインページで、上記の招待コードとメールアドレスを入力してください。<br>
         ご質問は <a href="mailto:arata@v-corp.inc" style="color: #5a7e5a;">arata@v-corp.inc</a> まで。
       </p>`,
    ),
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
