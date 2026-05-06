import { TRIAL_MAX_POSTS } from "@/lib/trial";

export function TrialBanner({
  hoursLeft,
  postsRemaining,
}: {
  hoursLeft: number;
  postsRemaining: number;
}) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-sage/40 bg-sage/5 p-4 text-sm text-ink"
    >
      <div className="flex items-start gap-2">
        <span aria-hidden>🌱</span>
        <div className="flex-1">
          <p>
            <strong>ようこそ、よりそいへ</strong>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-sumi">
            最初の 24 時間は <strong>{TRIAL_MAX_POSTS} 投稿まで</strong>、
            写真・動画は控えていただいています (スパム対策)。
            <br />
            あと <strong>{hoursLeft} 時間</strong>で全機能が使えます。
            残り <strong>{postsRemaining} 投稿</strong>。
          </p>
        </div>
      </div>
    </div>
  );
}
