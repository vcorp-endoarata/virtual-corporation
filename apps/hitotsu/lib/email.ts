/**
 * Resend API クライアント (fetch ベース、SDK 不要)
 *
 * RESEND_API_KEY: Resend Pro の hitotsu 用 API key
 * From は noreply@v-corp.inc 固定 (Resend で v-corp.inc ドメイン認証済)
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM = "ひとつ <noreply@v-corp.inc>";

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      error: `Resend ${res.status}: ${text.slice(0, 200)}`,
    };
  }
  const data = (await res.json()) as { id?: string };
  return { ok: true, id: data.id ?? "unknown" };
}

// -----------------------------------------------------------------
// 招待メールテンプレート (cream / sage / sakura ブランド)
// -----------------------------------------------------------------

export function inviteEmailHtml(opts: {
  code: string;
  loginUrl?: string;
}): string {
  const url = opts.loginUrl ?? "https://hitotsu.v-corp.inc/login";
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>β版へのご招待 — ひとつ</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e6;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic',YuGothic,'Meiryo',sans-serif;color:#3a4a3f;line-height:1.8;">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#f5f0e6;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#fdfbf5;border:1px solid #e8dec8;border-radius:14px;">
<tr><td style="padding:36px 40px 8px;"><p style="margin:0;font-size:11px;letter-spacing:0.3em;color:#e8c2c4;text-transform:uppercase;">ひとつ</p></td></tr>
<tr><td style="padding:8px 40px 0;">
<h1 style="margin:0 0 20px;font-size:24px;font-weight:600;color:#2d3a30;line-height:1.45;">β版へのご招待です</h1>
<p style="margin:0 0 16px;font-size:15px;color:#5b6b5f;">「ひとつ」 β版にご招待します。</p>
<p style="margin:0 0 16px;font-size:15px;color:#5b6b5f;">下のコードを使って、<strong>7 日間無料試用付き</strong>でご利用いただけます。</p>
</td></tr>
<tr><td style="padding:0 40px 8px;">
<div style="background:#f5f0e6;border:1px solid #e8dec8;border-radius:10px;padding:20px;text-align:center;">
<p style="margin:0 0 6px;font-size:11px;color:#a5b3a8;letter-spacing:0.2em;text-transform:uppercase;">招待コード</p>
<p style="margin:0;font-size:22px;font-weight:700;color:#2d3a30;letter-spacing:0.05em;font-family:'SF Mono','Menlo','Consolas',monospace;">${escapeHtml(opts.code)}</p>
</div>
</td></tr>
<tr><td align="center" style="padding:24px 40px 8px;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td align="center" style="background-color:#3a4a3f;border-radius:10px;">
<a href="${url}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#fdfbf5;text-decoration:none;">ひとつ にログイン</a>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px 40px 8px;">
<p style="margin:0 0 8px;font-size:12px;color:#8a9a8e;">ログイン手順:</p>
<ol style="margin:0 0 16px;padding-left:20px;font-size:12px;color:#5b6b5f;line-height:1.9;">
<li><a href="${url}" style="color:#5b6b5f;text-decoration:underline;">${url}</a> にアクセス</li>
<li>招待コードと メールアドレス を入力</li>
<li>届くマジックリンクをタップ</li>
<li>4 つの質問に答えて「今日のひとつ」スタート</li>
</ol>
</td></tr>
<tr><td style="padding:0 40px;"><div style="border-top:1px solid #e8dec8;"></div></td></tr>
<tr><td style="padding:20px 40px 36px;">
<p style="margin:0 0 6px;font-size:11px;color:#a5b3a8;line-height:1.7;">・このコードは 1 度のみ有効です。</p>
<p style="margin:0 0 6px;font-size:11px;color:#a5b3a8;line-height:1.7;">・登録後、Stripe で 7 日間無料試用が始まります。試用中の解約で課金は発生しません。</p>
<p style="margin:0 0 6px;font-size:11px;color:#a5b3a8;line-height:1.7;">・7/1 に正式ローンチ予定です。</p>
<p style="margin:0;font-size:11px;color:#a5b3a8;line-height:1.7;">・ご質問は <a href="mailto:arata@v-corp.inc" style="color:#5b6b5f;">arata@v-corp.inc</a> まで。</p>
</td></tr>
</table>
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:520px;margin-top:24px;"><tr><td align="center" style="padding:0 20px;">
<p style="margin:0 0 6px;font-size:11px;color:#a5b3a8;">「今日のひとつだけ」を AI が決める。静かな学習伴走。</p>
<p style="margin:0;font-size:10px;color:#c2cdc6;">© V-Corp · 運営: 遠藤新大</p>
</td></tr></table>
</td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
