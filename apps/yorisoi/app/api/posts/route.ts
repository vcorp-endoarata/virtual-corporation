import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getTrialStatus, TRIAL_MAX_POSTS } from "@/lib/trial";

const Body = z.object({
  body: z.string().trim().min(1).max(500),
  category: z.enum([
    "feeling",
    "worry",
    "experience",
    "question",
    "celebration",
    "diary",
  ]),
  space: z.enum(["self", "family", "shared"]),
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

  // role と space の整合性チェック (RLS でも弾かれるが UX のため事前)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, created_at")
    .eq("id", user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ error: "プロフィールがありません" }, { status: 400 });
  }

  // トライアル期間中 (登録から 24h) は投稿数制限
  const trial = await getTrialStatus(supabase, user.id, profile.created_at);
  if (trial.isTrial && trial.postsRemaining <= 0) {
    return NextResponse.json(
      {
        error: `新規アカウントは 24 時間で ${TRIAL_MAX_POSTS} 投稿までです。あと ${trial.hoursLeft} 時間で解除されます。`,
      },
      { status: 429 },
    );
  }
  if (parsed.data.space === "self" && profile.role !== "self") {
    return NextResponse.json(
      { error: "「当事者の場」には投稿できません" },
      { status: 403 },
    );
  }
  if (
    parsed.data.space === "family" &&
    profile.role !== "family" &&
    profile.role !== "supporter"
  ) {
    return NextResponse.json(
      { error: "「身近な人の場」には投稿できません" },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      space: parsed.data.space,
      body: parsed.data.body,
      category: parsed.data.category,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
