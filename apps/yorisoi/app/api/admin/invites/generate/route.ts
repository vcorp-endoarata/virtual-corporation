import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateInviteCode } from "@/lib/invite";

const Body = z.object({
  count: z.number().int().min(1).max(100).default(20),
  source: z
    .enum(["manual", "x_reply", "founder", "waitlist"])
    .default("manual"),
  note: z.string().max(200).nullable().optional(),
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
  const rows = Array.from({ length: parsed.data.count }, () => ({
    code: generateInviteCode(),
    product: "yorisoi",
    source: parsed.data.source,
    created_by: user.id,
    note: parsed.data.note ?? null,
  }));

  const { data, error } = await admin
    .from("invite_codes")
    .insert(rows)
    .select("code");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, codes: data?.map((r) => r.code) ?? [] });
}
