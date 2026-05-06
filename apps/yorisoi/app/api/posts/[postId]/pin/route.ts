import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  // 自分の投稿か確認
  const { data: post } = await supabase
    .from("posts")
    .select("id, author_id, status")
    .eq("id", postId)
    .maybeSingle();

  if (!post || post.author_id !== user.id) {
    return NextResponse.json(
      { error: "自分の投稿のみピン留めできます" },
      { status: 403 },
    );
  }
  if (post.status !== "published") {
    return NextResponse.json(
      { error: "公開中の投稿のみピン留めできます" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ pinned_post_id: postId })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未ログインです" }, { status: 401 });
  }

  // ピン留めされてる投稿が postId と一致するときのみ解除
  const { error } = await supabase
    .from("profiles")
    .update({ pinned_post_id: null })
    .eq("id", user.id)
    .eq("pinned_post_id", postId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
