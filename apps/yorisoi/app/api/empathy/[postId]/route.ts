import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enqueueUnazukiNotification } from "@/lib/notifications";

type Params = { params: Promise<{ postId: string }> };

/** うなずく */
export async function POST(_req: Request, { params }: Params) {
  const { postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  // 自分の投稿にはうなずけない
  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .single();
  if (!post) {
    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
  }
  if (post.author_id === user.id) {
    return NextResponse.json(
      { error: "自分の投稿にはうなずけません" },
      { status: 403 },
    );
  }

  const { error } = await supabase.from("empathy").insert({
    post_id: postId,
    user_id: user.id,
  });
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 既存うなずきの toggle 再追加 (23505) ではない、本当の新規うなずきだけ通知
  if (!error) {
    await enqueueUnazukiNotification({
      recipientId: post.author_id,
      actorId: user.id,
      postId,
    });
  }

  return NextResponse.json({ ok: true });
}

/** うなずきを取り消す */
export async function DELETE(_req: Request, { params }: Params) {
  const { postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  const { error } = await supabase
    .from("empathy")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
