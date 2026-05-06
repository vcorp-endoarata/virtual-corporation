import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  // 通知
  notify_unazuki: z.boolean().optional(),
  notify_reply: z.boolean().optional(),
  notify_admin_response: z.boolean().optional(),
  notify_email_freq: z.enum(["realtime", "daily", "weekly", "never"]).optional(),
  // アクセシビリティ
  font_size: z.enum(["small", "medium", "large"]).optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: "更新する項目がありません" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
