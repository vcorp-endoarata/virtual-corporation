import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase";

const Body = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "メールアドレスが正しくありません" },
      { status: 400 },
    );
  }

  const supabase = supabaseService();
  const { error } = await supabase
    .from("waitlist")
    .insert({
      email: parsed.data.email,
      product: "yorisoi",
      source: "lp",
      user_agent: req.headers.get("user-agent"),
      referrer: req.headers.get("referer"),
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      // 既登録は成功として返す (情報漏えい防止)
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
