import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  kind: z.enum(["block", "mute"]),
});

type Params = { params: Promise<{ id: string }> };

/** ブロック / ミュートを作成 */
export async function POST(req: Request, { params }: Params) {
  const { id: targetId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }
  if (user.id === targetId) {
    return NextResponse.json(
      { error: "自分自身を対象にはできません" },
      { status: 400 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  const { error } = await supabase.from("user_relations").insert({
    user_id: user.id,
    target_id: targetId,
    kind: parsed.data.kind,
  });

  // 既に存在する場合 (23505) は OK 扱い
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** ブロック / ミュートを解除 */
export async function DELETE(req: Request, { params }: Params) {
  const { id: targetId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  if (!kind || (kind !== "block" && kind !== "mute")) {
    return NextResponse.json({ error: "kind が必要です" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_relations")
    .delete()
    .eq("user_id", user.id)
    .eq("target_id", targetId)
    .eq("kind", kind);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
