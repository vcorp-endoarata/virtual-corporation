"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReplyCard } from "@/components/ReplyCard";

type Reply = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  author: {
    id: string;
    nickname: string;
    role: string;
    show_role?: boolean;
  };
  media?: {
    id: string;
    kind: "image" | "video";
    storage_path: string;
    width?: number | null;
    height?: number | null;
  }[];
};

export function PostRepliesRealtime({
  postId,
  initialReplies,
  currentUserId,
}: {
  postId: string;
  initialReplies: Reply[];
  currentUserId: string;
}) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies);

  useEffect(() => {
    setReplies(initialReplies);
  }, [initialReplies]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`replies:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "replies",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          const np = payload.new as {
            id: string;
            author_id: string;
            status: string;
          };
          if (np.status !== "published") return;
          if (np.author_id === currentUserId) return;

          const { data } = await supabase
            .from("replies")
            .select(
              `
              id, body, created_at, author_id,
              author:profiles!replies_author_id_fkey(id, nickname, role, show_role),
              media:post_media!post_media_reply_id_fkey(id, kind, storage_path, width, height)
            `,
            )
            .eq("id", np.id)
            .maybeSingle();

          if (data) {
            setReplies((prev) => {
              if (prev.some((r) => r.id === np.id)) return prev;
              return [...prev, data as unknown as Reply];
            });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "replies",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const u = payload.new as { id: string; status: string };
          if (u.status !== "published") {
            setReplies((prev) => prev.filter((r) => r.id !== u.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, currentUserId]);

  if (replies.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-wabi p-8 text-center text-sm text-sumi/60">
        まだ返信はありません。
        <br />
        最初の「そばにいるよ」を、書いてみませんか?
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {replies.map((reply) => (
        <ReplyCard
          key={reply.id}
          reply={reply}
          isOwn={reply.author_id === currentUserId}
        />
      ))}
    </div>
  );
}
