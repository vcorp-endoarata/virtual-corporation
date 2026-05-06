import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  target_type: z.enum(["post", "user", "media", "reply"]),
  target_id: z.string().uuid(),
  reason: z.enum([
    "attack_individual",
    "spam",
    "sexual",
    "self_harm",
    "minor_safety",
    "no_consent_media",
    "misinformation",
    "other",
  ]),
  detail: z.string().max(1000).nullable().optional(),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容が正しくありません" }, { status: 400 });
  }

  // 重複通報抑止 (同じ user × target × reason は5分以内なら無視)
  const { data: existing } = await supabase
    .from("reports")
    .select("id, created_at")
    .eq("reporter_id", user.id)
    .eq("target_type", parsed.data.target_type)
    .eq("target_id", parsed.data.target_id)
    .eq("reason", parsed.data.reason)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const ageMs = Date.now() - new Date(existing.created_at).getTime();
    if (ageMs < 5 * 60 * 1000) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: parsed.data.target_type,
    target_id: parsed.data.target_id,
    reason: parsed.data.reason,
    detail: parsed.data.detail ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
