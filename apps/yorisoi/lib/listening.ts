import type { SupabaseClient } from "@supabase/supabase-js";
import { getRelationFilters } from "@/lib/relations";

export async function getWaitingPosts(
  supabase: SupabaseClient,
  userId: string,
  limit = 30,
) {
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      id, body, category, space, empathy_count, reply_count, created_at,
      author:profiles!posts_author_id_fkey(id, nickname, role, show_role, avatar_url),
      media:post_media(id, kind, storage_path, width, height)
    `,
    )
    .eq("status", "published")
    .eq("reply_count", 0)
    .in("category", ["worry", "question"])
    .neq("author_id", userId)
    .order("created_at", { ascending: true })
    .limit(limit);

  const { hiddenAuthors } = await getRelationFilters(userId);
  return (posts ?? []).filter((p) => {
    const author = (p as never as { author: { id: string } }).author;
    return !hiddenAuthors.has(author?.id);
  });
}
