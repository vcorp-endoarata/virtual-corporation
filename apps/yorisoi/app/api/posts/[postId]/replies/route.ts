import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { enqueueReplyNotification } from "@/lib/notifications";

const Body = z.object({
  body: z.string().trim().min(1).max(500),
});

type Params = { params: Promise<{ postId: string }> };

export async function POST(req: Request, { params }: Params) {
  const { postId } = await params;
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
    return NextResponse.json(
      { error: "返信内容が正しくありません (1〜500字)" },
      { status: 400 },
    );
  }

  const { data: post } = await supabase
    .from("posts")
    .select("id, status, author_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post) {
    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
  }
  if (post.status !== "published") {
    return NextResponse.json(
      { error: "この投稿には返信できません" },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("replies")
    .insert({
      post_id: postId,
      author_id: user.id,
      body: parsed.data.body,
    })
    .select("id, body, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 投稿の作者に通知 (自分の投稿への自分の返信は enqueue 内でスキップ)
  await enqueueReplyNotification({
    recipientId: post.author_id,
    actorId: user.id,
    postId,
    replyId: data.id,
    replyBody: parsed.data.body,
  });

  return NextResponse.json({ ok: true, reply: data });
}
