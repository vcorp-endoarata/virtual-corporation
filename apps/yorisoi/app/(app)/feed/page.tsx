import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostComposer } from "@/components/PostComposer";
import { SpaceSwitcher } from "@/components/SpaceSwitcher";
import { CategoryFilter } from "@/components/CategoryFilter";
import { TrialBanner } from "@/components/TrialBanner";
import { FeedRealtime } from "@/components/FeedRealtime";
import { ListeningSection } from "@/components/ListeningSection";
import { getRelationFilters } from "@/lib/relations";
import { getTrialStatus } from "@/lib/trial";
import { getWaitingPosts } from "@/lib/listening";

type SpaceKey = "self" | "family" | "shared";
type Category =
  | "feeling"
  | "worry"
  | "experience"
  | "question"
  | "celebration"
  | "diary";

const VALID_CATEGORIES: Category[] = [
  "feeling",
  "worry",
  "experience",
  "question",
  "celebration",
  "diary",
];

export const metadata = {
  title: "フィード — よりそい",
  robots: { index: false, follow: false },
};

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ space?: string; category?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, role, created_at, is_admin")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/onboarding");

  const accessibleSpaces: SpaceKey[] =
    profile.role === "self" ? ["self", "shared"] : ["family", "shared"];
  const defaultSpace = accessibleSpaces[0];

  const params = await searchParams;
  const requested = params.space as SpaceKey | undefined;
  const space: SpaceKey = (
    requested && accessibleSpaces.includes(requested) ? requested : defaultSpace
  ) as SpaceKey;

  const requestedCategory = params.category as Category | undefined;
  const category =
    requestedCategory && VALID_CATEGORIES.includes(requestedCategory)
      ? requestedCategory
      : undefined;

  let query = supabase
    .from("posts")
    .select(
      `
      id, body, category, space, empathy_count, reply_count, created_at,
      author:profiles!posts_author_id_fkey(id, nickname, role, show_role, avatar_url),
      media:post_media(id, kind, storage_path, width, height)
    `,
    )
    .eq("space", space)
    .eq("status", "published");
  if (category) query = query.eq("category", category);
  const { data: posts } = await query
    .order("created_at", { ascending: false })
    .limit(50);

  const [
    { data: myEmpathy },
    { data: myBookmarks },
    { hiddenAuthors },
    trial,
    waitingPosts,
  ] = await Promise.all([
    supabase.from("empathy").select("post_id").eq("user_id", user.id),
    supabase.from("bookmarks").select("post_id").eq("user_id", user.id),
    getRelationFilters(user.id),
    getTrialStatus(supabase, user.id, profile.created_at),
    getWaitingPosts(supabase, user.id, 10),
  ]);
  const empathySet = new Set((myEmpathy ?? []).map((e) => e.post_id));
  const bookmarkSet = new Set((myBookmarks ?? []).map((b) => b.post_id));

  const hiddenAuthorIds = Array.from(hiddenAuthors);
  const filteredPosts = (posts ?? []).filter((p) => {
    const author = (p as never as { author: { id: string } }).author;
    return !hiddenAuthors.has(author?.id);
  });

  return (
    <div className="space-y-6">
      <SpaceSwitcher current={space} accessible={accessibleSpaces} />
      <CategoryFilter current={category} space={space} />

      {trial.isTrial && (
        <TrialBanner
          hoursLeft={trial.hoursLeft}
          postsRemaining={trial.postsRemaining}
        />
      )}

      <PostComposer
        defaultSpace={space}
        role={profile.role}
        trial={{
          isTrial: trial.isTrial,
          postsRemaining: trial.postsRemaining,
          mediaAllowed: trial.mediaAllowed,
        }}
      />

      <FeedRealtime
        initialPosts={filteredPosts as never}
        initialEmpathySet={Array.from(empathySet)}
        initialBookmarkSet={Array.from(bookmarkSet)}
        hiddenAuthorIds={hiddenAuthorIds}
        space={space}
        category={category}
        currentUserId={user.id}
        isAdmin={profile.is_admin === true}
        emptyMessage={
          category
            ? "このカテゴリーの投稿はまだありません。\n最初のひとことを、書いてみませんか?"
            : "まだ投稿がありません。\n最初のひとことを、書いてみませんか?"
        }
      />

      <ListeningSection
        posts={waitingPosts}
        empathySet={empathySet}
        bookmarkSet={bookmarkSet}
        preview
      />
    </div>
  );
}
