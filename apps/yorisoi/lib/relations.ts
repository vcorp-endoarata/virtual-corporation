import { createAdminClient } from "@/lib/supabase/admin";

/**
 * フィード/投稿一覧で除外すべきユーザー ID を返す。
 *
 * 新仕様 (block / mute の役割を分離):
 * - ミュート: 「相手を見たくない」
 *   → 自分が mute した相手の投稿を 自分のフィードから除外
 * - ブロック: 「自分を見せたくない」
 *   → 自分を block している相手のフィード/プロフィール検索などに自分の投稿を出さない
 *     つまり、閲覧者目線では「自分を block している相手の投稿」を 自分のフィードから除外
 *     (相手のフィードに自分の投稿を出さないのと等価な実装)
 *
 * 実装上は 自分のフィードで隠すべき著者 = mute した相手 ∪ 自分を block している相手
 * となる。
 *
 * RLS では「自分が user_id である行」しか見えないので、自分を block している
 * (= target_id が自分) 行を読むために service_role の admin client を使う。
 * これは サーバーサイドのみで使われ、外部に直接公開されない。
 */
export async function getRelationFilters(userId: string): Promise<{
  hiddenAuthors: Set<string>;
}> {
  const admin = createAdminClient();

  const [{ data: myMutes }, { data: blockedMe }] = await Promise.all([
    admin
      .from("user_relations")
      .select("target_id")
      .eq("user_id", userId)
      .eq("kind", "mute"),
    admin
      .from("user_relations")
      .select("user_id")
      .eq("target_id", userId)
      .eq("kind", "block"),
  ]);

  const hiddenAuthors = new Set<string>([
    ...((myMutes ?? []).map((r) => r.target_id as string)),
    ...((blockedMe ?? []).map((r) => r.user_id as string)),
  ]);

  return { hiddenAuthors };
}
