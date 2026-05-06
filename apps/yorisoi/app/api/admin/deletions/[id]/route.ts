import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const Body = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(500).nullable().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: dr } = await admin
    .from("deletion_requests")
    .select("id, post_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!dr) {
    return NextResponse.json({ error: "申請が見つかりません" }, { status: 404 });
  }
  if (dr.status !== "pending") {
    return NextResponse.json(
      { error: "この申請は既に処理済みです" },
      { status: 400 },
    );
  }

  const newStatus = parsed.data.action === "approve" ? "approved" : "rejected";

  if (parsed.data.action === "approve") {
    const { error: postErr } = await admin
      .from("posts")
      .update({ status: "deleted" })
      .eq("id", dr.post_id);
    if (postErr) {
      return NextResponse.json({ error: postErr.message }, { status: 500 });
    }
  }

  const { error: drErr } = await admin
    .from("deletion_requests")
    .update({
      status: newStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_note: parsed.data.note ?? null,
    })
    .eq("id", id);
  if (drErr) {
    return NextResponse.json({ error: drErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
