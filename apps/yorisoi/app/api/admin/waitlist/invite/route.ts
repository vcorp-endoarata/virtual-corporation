import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateInviteCode } from "@/lib/invite";
import { sendEmail, emailTemplates } from "@/lib/email";

const Body = z.object({
  count: z.number().int().min(1).max(50).default(10),
});

export async function POST(req: Request) {
  // admin 認証
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 未招待の先頭 N 件を取得 (登録順)
  const { data: pending, error: fetchErr } = await admin
    .from("waitlist")
    .select("id, email")
    .eq("product", "yorisoi")
    .is("invited_at", null)
    .order("registered_at", { ascending: true })
    .limit(parsed.data.count);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!pending || pending.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  // 各 email にコード割り当て + メール送信 + waitlist 更新
  const results: { email: string; sent: boolean; error?: string }[] = [];
  for (const row of pending) {
    const code = generateInviteCode();
    const { error: insertErr } = await admin.from("invite_codes").insert({
      code,
      product: "yorisoi",
      source: "waitlist",
      created_by: user.id,
      note: `Auto-invited from waitlist: ${row.email}`,
    });
    if (insertErr) {
      results.push({ email: row.email, sent: false, error: insertErr.message });
      continue;
    }

    const emailResult = await sendEmail({
      to: row.email,
      subject: "【よりそい】α 版へのご招待です",
      html: emailTemplates.invite({ code }),
    });

    await admin
      .from("waitlist")
      .update({
        invited_at: new Date().toISOString(),
        invite_code: code,
      })
      .eq("id", row.id);

    results.push({
      email: row.email,
      sent: emailResult.ok,
      error: emailResult.error,
    });
  }

  return NextResponse.json({
    ok: true,
    sent: results.filter((r) => r.sent).length,
    failed: results.filter((r) => !r.sent).length,
    results,
  });
}
