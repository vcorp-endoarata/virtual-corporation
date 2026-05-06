import Link from "next/link";
import { Avatar } from "@/components/Avatar";

const ROLE_LABEL: Record<string, string> = {
  self: "当事者",
  family: "家族",
  supporter: "支援者",
};

export function AppHeader({
  nickname,
  role,
  avatarUrl,
  isAdmin = false,
  unreadNotifications = 0,
}: {
  nickname: string;
  role: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  unreadNotifications?: number;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-wabi/60 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/feed" className="font-display text-xl text-ink">
          よりそい
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/profile"
            aria-label="自分のプロフィール"
            className="flex items-center gap-2 text-sumi hover:text-sage"
          >
            <Avatar url={avatarUrl} nickname={nickname} size="sm" />
            <span className="rounded-full bg-sage/10 px-2 py-0.5 text-xs text-sage">
              {ROLE_LABEL[role] ?? role}
            </span>
            <span className="hidden md:inline">{nickname}</span>
          </Link>
          <Link
            href="/search"
            aria-label="検索"
            title="検索"
            className="text-sumi hover:text-sage"
          >
            🔍
          </Link>
          <Link
            href="/bookmarks"
            aria-label="ブックマーク"
            title="ブックマーク"
            className="text-sumi hover:text-sage"
          >
            🔖
          </Link>
          <Link
            href="/notifications"
            aria-label={
              unreadNotifications > 0
                ? `通知 (${unreadNotifications}件未読)`
                : "通知"
            }
            title="通知"
            className="relative text-sumi hover:text-sage"
          >
            <span aria-hidden>🔔</span>
            {unreadNotifications > 0 && (
              <span className="absolute -right-2 -top-1 min-w-[18px] rounded-full bg-sakura px-1 text-center text-[10px] font-semibold text-cream">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="モデレーション"
              title="モデレーション"
              className="text-sumi hover:text-sage"
            >
              🛡
            </Link>
          )}
          <Link
            href="/settings"
            aria-label="設定"
            className="text-sumi hover:text-sage"
          >
            ⚙
          </Link>
        </div>
      </div>
    </header>
  );
}
