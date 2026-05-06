"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ReportButton } from "@/components/ReportButton";
import { PostMediaDisplay } from "@/components/PostMediaDisplay";

const ROLE_LABEL: Record<string, string> = {
  self: "当事者",
  family: "家族",
  supporter: "支援者",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}日前`;
  const mo = Math.floor(day / 30);
  return `${mo}ヶ月前`;
}

type ReplyCardProps = {
  reply: {
    id: string;
    body: string;
    created_at: string;
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
  isOwn: boolean;
};

export function ReplyCard({ reply, isOwn }: ReplyCardProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    const res = await fetch(`/api/replies/${reply.id}`, { method: "DELETE" });
    if (res.ok) {
      startTransition(() => router.refresh());
    } else {
      setConfirming(false);
    }
  }

  return (
    <article className="rounded-2xl border border-wabi/60 bg-white/50 p-4">
      <header className="flex items-center justify-between text-xs text-sumi/70">
        <div className="flex items-center gap-2">
          <Link
            href={`/user/${reply.author.id}`}
            className="font-semibold text-ink hover:text-sage hover:underline"
          >
            {reply.author.nickname}
          </Link>
          {reply.author.show_role !== false && (
            <span className="rounded-full bg-sage/10 px-2 py-0.5 text-sage">
              {ROLE_LABEL[reply.author.role] ?? reply.author.role}
            </span>
          )}
        </div>
        <time dateTime={reply.created_at}>{timeAgo(reply.created_at)}</time>
      </header>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {reply.body}
      </p>

      {reply.media && reply.media.length > 0 && (
        <PostMediaDisplay media={reply.media} />
      )}

      <footer className="mt-3 flex items-center justify-end gap-2">
        {isOwn ? (
          confirming ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="text-xs text-sumi hover:underline"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs text-sakura hover:underline disabled:opacity-50"
              >
                {isPending ? "削除中…" : "本当に削除する"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs text-sumi/60 hover:text-sakura"
            >
              削除
            </button>
          )
        ) : (
          <ReportButton targetType="reply" targetId={reply.id} />
        )}
      </footer>
    </article>
  );
}
