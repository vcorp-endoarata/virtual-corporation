import Link from "next/link";
import { UnazukiButton } from "@/components/UnazukiButton";
import { ReportButton } from "@/components/ReportButton";
import { BookmarkButton } from "@/components/BookmarkButton";
import { PinButton } from "@/components/PinButton";
import { PostDeleteButton } from "@/components/PostDeleteButton";
import { Avatar } from "@/components/Avatar";
import { PostMediaDisplay } from "@/components/PostMediaDisplay";
import { renderBodyWithTags } from "@/lib/hashtags";

const CATEGORY_LABEL: Record<string, string> = {
  feeling: "🌥 気持ち",
  worry: "💭 悩み",
  experience: "✨ 体験",
  question: "❓ 質問",
  celebration: "🌱 お祝い",
  diary: "📝 日記",
};

const ROLE_LABEL: Record<string, string> = {
  self: "当事者",
  family: "家族",
  supporter: "支援者",
};

type PostCardProps = {
  post: {
    id: string;
    body: string;
    category: string;
    space: string;
    empathy_count: number;
    reply_count?: number;
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
  hasEmpathy: boolean;
  isOwn: boolean;
  hasBookmark?: boolean;
  isPinned?: boolean;
  showPinControl?: boolean;
  pinnedBadge?: boolean;
  hideReplyLink?: boolean;
  isAdmin?: boolean;
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

export function PostCard({
  post,
  hasEmpathy,
  isOwn,
  hasBookmark = false,
  isPinned = false,
  showPinControl = false,
  pinnedBadge = false,
  hideReplyLink = false,
  isAdmin = false,
}: PostCardProps) {
  const replyCount = post.reply_count ?? 0;

  return (
    <article className="rounded-2xl border border-wabi bg-white/70 p-5">
      {pinnedBadge && (
        <div className="mb-2 flex items-center gap-1 text-xs text-sage">
          <span aria-hidden>📌</span>
          <span>ピン留めされた投稿</span>
        </div>
      )}
      <header className="flex items-center justify-between text-xs text-sumi/70">
        <div className="flex items-center gap-2">
          <Avatar
            url={post.author.avatar_url}
            nickname={post.author.nickname}
            size="sm"
            href={`/user/${post.author.id}`}
          />
          <Link
            href={`/user/${post.author.id}`}
            className="font-semibold text-ink hover:text-sage hover:underline"
          >
            {post.author.nickname}
          </Link>
          {post.author.show_role !== false && (
            <span className="rounded-full bg-sage/10 px-2 py-0.5 text-sage">
              {ROLE_LABEL[post.author.role] ?? post.author.role}
            </span>
          )}
          <span>•</span>
          <span>{CATEGORY_LABEL[post.category] ?? post.category}</span>
        </div>
        <time dateTime={post.created_at}>{timeAgo(post.created_at)}</time>
      </header>

      <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-ink">
        {renderBodyWithTags(post.body)}
      </p>

      {post.media && post.media.length > 0 && (
        <PostMediaDisplay media={post.media} />
      )}

      <footer className="mt-4 flex items-center justify-between gap-1 border-t border-wabi/60 pt-3">
        <div className="flex items-center gap-1">
          <UnazukiButton
            postId={post.id}
            initialCount={post.empathy_count}
            initialActive={hasEmpathy}
            disabled={isOwn}
          />
          {!hideReplyLink && (
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-base text-sumi/70 whitespace-nowrap transition hover:bg-sage/10 hover:text-sage"
              aria-label={`返信を見る (${replyCount}件)`}
              title={replyCount > 0 ? `返信 ${replyCount}件` : "返信する"}
            >
              <span aria-hidden>💬</span>
              {replyCount > 0 && (
                <span className="rounded-full bg-sage/15 px-1.5 py-0.5 text-[11px] font-bold text-sage tabular-nums">
                  {replyCount}
                </span>
              )}
            </Link>
          )}
          <BookmarkButton postId={post.id} initialActive={hasBookmark} />
          {showPinControl && isOwn && (
            <PinButton postId={post.id} initialPinned={isPinned} />
          )}
        </div>
        <div className="flex items-center gap-1">
          {isOwn && (
            <PostDeleteButton postId={post.id} isAdmin={isAdmin} />
          )}
          <ReportButton targetType="post" targetId={post.id} disabled={isOwn} />
        </div>
      </footer>
    </article>
  );
}
