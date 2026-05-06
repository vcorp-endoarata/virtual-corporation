"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/PostCard";

type FeedPost = {
  id: string;
  body: string;
  category: string;
  space: string;
  empathy_count: number;
  reply_count: number;
  created_at: string;
  author: {
    id: string;
    nickname: string;
    role: string;
    show_role?: boolean;
    avatar_url?: string | null;
  };
  media?: {
    id: string;
    kind: "image" | "video";
    storage_path: string;
    width?: number | null;
    height?: number | null;
  }[];
};

export function FeedRealtime({
  initialPosts,
  initialEmpathySet,
  initialBookmarkSet,
  hiddenAuthorIds,
  space,
  category,
  currentUserId,
  emptyMessage,
  isAdmin = false,
}: {
  initialPosts: FeedPost[];
  initialEmpathySet: string[];
  initialBookmarkSet: string[];
  hiddenAuthorIds: string[];
  space: string;
  category?: string;
  currentUserId: string;
  emptyMessage: string;
  isAdmin?: boolean;
}) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const empathySet = new Set(initialEmpathySet);
  const bookmarkSet = new Set(initialBookmarkSet);
  const hiddenSet = useRef(new Set(hiddenAuthorIds));

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    hiddenSet.current = new Set(hiddenAuthorIds);
  }, [hiddenAuthorIds]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`feed:${space}:${category ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          filter: `space=eq.${space}`,
        },
        async (payload) => {
          const np = payload.new as {
            id: string;
            author_id: string;
            status: string;
            category: string;
          };
          if (np.status !== "published") return;
          if (np.author_id === currentUserId) return;
          if (hiddenSet.current.has(np.author_id)) return;
          if (category && np.category !== category) return;

          const { data } = await supabase
            .from("posts")
            .select(
              `
              id, body, category, space, empathy_count, reply_count, created_at,
              author:profiles!posts_author_id_fkey(id, nickname, role, show_role, avatar_url),
              media:post_media(id, kind, storage_path, width, height)
            `,
            )
            .eq("id", np.id)
            .maybeSingle();

          if (data) {
            setPosts((prev) => {
              if (prev.some((p) => p.id === np.id)) return prev;
              return [data as unknown as FeedPost, ...prev];
            });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
          filter: `space=eq.${space}`,
        },
        (payload) => {
          const u = payload.new as {
            id: string;
            empathy_count: number;
            reply_count: number;
            status: string;
          };
          if (u.status !== "published") {
            setPosts((prev) => prev.filter((p) => p.id !== u.id));
            return;
          }
          setPosts((prev) =>
            prev.map((p) =>
              p.id === u.id
                ? {
                    ...p,
                    empathy_count: u.empathy_count,
                    reply_count: u.reply_count,
                  }
                : p,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          const deleted = payload.old as { id: string };
          setPosts((prev) => prev.filter((p) => p.id !== deleted.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [space, category, currentUserId]);

  if (posts.length === 0) {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border border-dashed border-wabi p-10 text-center text-sm text-sumi/70">
          {emptyMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p as never}
          hasEmpathy={empathySet.has(p.id)}
          hasBookmark={bookmarkSet.has(p.id)}
          isOwn={p.author?.id === currentUserId}
          isAdmin={isAdmin}
        />
      ))}
    </section>
  );
}
