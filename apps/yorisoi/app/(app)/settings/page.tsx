import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PrivacyForm } from "@/components/PrivacyForm";
import { NotifyForm } from "@/components/NotifyForm";
import { AccessibilityForm } from "@/components/AccessibilityForm";
import { SubscribeButton } from "@/components/SubscribeButton";
import { RelationsList } from "@/components/RelationsList";
import { EmailChangeForm } from "@/components/EmailChangeForm";
import { isBetaPeriod } from "@/lib/access";

export const metadata = {
  title: "設定 — よりそい",
  robots: { index: false, follow: false },
};

const SUB_STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  trialing: { label: "🌱 無料トライアル中", tone: "bg-sage/10 text-sage" },
  active: { label: "✅ 有効", tone: "bg-sage/10 text-sage" },
  past_due: { label: "⚠️ 支払い遅延", tone: "bg-sakura/10 text-sakura" },
  canceled: { label: "解約済み", tone: "bg-sumi/10 text-sumi" },
  incomplete: { label: "登録未完了", tone: "bg-sumi/10 text-sumi" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ subscription?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, show_role, show_prefecture, show_city, show_bio, notify_unazuki, notify_reply, notify_admin_response, notify_email_freq, font_size, theme")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/onboarding");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, trial_end, current_period_end, cancel_at_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: relationsData } = await supabase
    .from("user_relations")
    .select(
      "target_id, kind, target:profiles!user_relations_target_id_fkey(id, nickname)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const relations = (relationsData ?? []).map((r) => ({
    target_id: r.target_id as string,
    kind: r.kind as "block" | "mute",
    target: r.target as unknown as { id: string; nickname: string },
  }));

  const isActive =
    subscription?.status &&
    ["trialing", "active"].includes(subscription.status);
  const inBeta = isBetaPeriod();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">設定</h1>

      {inBeta && (
        <div className="rounded-2xl border border-sage/40 bg-sage/5 p-4 text-sm text-ink">
          🌱 <strong>ベータ期間中</strong>: 全機能を無料でお使いいただけます。<br />
          応援したい方は、サブスクリプション登録もお気軽にどうぞ。
        </div>
      )}

      {params.subscription === "success" && (
        <div
          role="status"
          className="rounded-2xl border border-sage/40 bg-sage/5 p-4 text-sm text-ink"
        >
          🌿 サブスクの登録ありがとうございます。14日間の無料トライアルが始まりました。
        </div>
      )}
      {params.subscription === "cancelled" && (
        <div
          className="rounded-2xl border border-wabi bg-white/70 p-4 text-sm text-sumi"
        >
          サブスク登録をキャンセルしました。いつでもまた始められます。
        </div>
      )}

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">サブスクリプション</h2>

        {subscription ? (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-sumi">ステータス</span>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  SUB_STATUS_LABEL[subscription.status]?.tone ?? "bg-sumi/10 text-sumi"
                }`}
              >
                {SUB_STATUS_LABEL[subscription.status]?.label ??
                  subscription.status}
              </span>
            </div>
            {subscription.trial_end &&
              subscription.status === "trialing" && (
                <div className="flex justify-between text-sumi">
                  <span>無料期間終了</span>
                  <span className="text-ink">
                    {formatDate(subscription.trial_end)}
                  </span>
                </div>
              )}
            {subscription.current_period_end && (
              <div className="flex justify-between text-sumi">
                <span>次回更新日</span>
                <span className="text-ink">
                  {formatDate(subscription.current_period_end)}
                </span>
              </div>
            )}
            {subscription.cancel_at_period_end && (
              <p className="rounded-xl bg-sakura/5 p-2 text-xs text-sumi">
                次回更新日に解約されます。
              </p>
            )}
            {!isActive && (
              <div className="mt-4">
                <SubscribeButton />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm leading-relaxed text-sumi">
              よりそい は月額 ¥300 の安価な利用料で運営されています。<br />
              14日間の無料トライアルから始められます。
            </p>
            <SubscribeButton />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-sage/30 bg-sage/5 p-5">
        <h2 className="text-sm font-semibold text-ink">🌱 サポート (任意)</h2>
        <p className="mt-2 text-xs leading-relaxed text-sumi">
          サブスクリプションとは別に、ワンタイムでよりそいの運営をサポートできます。
          いただいたサポートは、利用料を払えない当事者の場所を守ることに使われます。
        </p>
        <Link
          href="/support"
          className="mt-4 inline-block rounded-full bg-sage px-4 py-1.5 text-sm font-semibold text-cream hover:opacity-90"
        >
          サポートする →
        </Link>
      </section>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">アカウント</h2>
        <dl className="mt-3 space-y-3 text-sm text-sumi">
          <div className="flex justify-between">
            <dt>ニックネーム</dt>
            <dd className="text-ink">{profile.nickname}</dd>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <dt>メールアドレス</dt>
              <dd className="text-ink">{user.email}</dd>
            </div>
            <div className="mt-2 flex justify-end">
              <EmailChangeForm currentEmail={user.email ?? ""} />
            </div>
          </div>
        </dl>
        <Link
          href="/profile/edit"
          className="mt-4 inline-block rounded-full border border-wabi px-4 py-1.5 text-sm text-sumi hover:bg-sage/5"
        >
          プロフィールを編集
        </Link>
      </section>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">ブロック・ミュート</h2>
        <ul className="mt-2 space-y-2 text-xs leading-relaxed text-sumi">
          <li>
            <strong className="text-ink">🔇 ミュート</strong>{" "}
            <span className="text-sumi/80">— 相手を見たくないとき</span>
            <br />
            <span className="text-sumi/70">
              この人の投稿が <strong>自分のフィード</strong> に出てこなくなります。相手にバレません。
            </span>
          </li>
          <li>
            <strong className="text-ink">🚫 ブロック</strong>{" "}
            <span className="text-sumi/80">— 自分を見せたくないとき</span>
            <br />
            <span className="text-sumi/70">
              自分の投稿が <strong>相手のフィード</strong> に出てこなくなります。相手にバレません。
            </span>
          </li>
        </ul>
        <p className="mt-3 text-xs text-sumi/60">
          どちらも後でいつでも解除できます。
        </p>
        <div className="mt-4">
          <RelationsList relations={relations} />
        </div>
      </section>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">プライバシー</h2>
        <p className="mt-1 text-xs text-sumi/70">
          他のユーザーに、あなたの情報をどこまで見せるかを選べます。
          ニックネームは常に表示されます。
        </p>
        <div className="mt-4">
          <PrivacyForm
            initial={{
              show_role: profile.show_role,
              show_prefecture: profile.show_prefecture,
              show_city: profile.show_city,
              show_bio: profile.show_bio,
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">通知</h2>
        <p className="mt-1 text-xs text-sumi/70">
          メールでお知らせする内容と頻度を設定できます。
        </p>
        <div className="mt-4">
          <NotifyForm
            initial={{
              notify_unazuki: profile.notify_unazuki,
              notify_reply: profile.notify_reply,
              notify_admin_response: profile.notify_admin_response,
              notify_email_freq: profile.notify_email_freq,
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">アクセシビリティ</h2>
        <p className="mt-1 text-xs text-sumi/70">
          見やすさを調整できます。
        </p>
        <div className="mt-4">
          <AccessibilityForm
            initial={{
              font_size: profile.font_size,
              theme: profile.theme,
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">情報</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/legal/terms" className="text-sage hover:underline">
              利用規約
            </Link>
          </li>
          <li>
            <Link href="/legal/privacy" className="text-sage hover:underline">
              プライバシーポリシー
            </Link>
          </li>
          <li>
            <Link href="/legal/tokutei" className="text-sage hover:underline">
              特定商取引法に基づく表記
            </Link>
          </li>
          <li>
            <Link href="/support" className="text-sage hover:underline">
              よりそい をサポート
            </Link>
          </li>
          <li>
            <a
              href="mailto:arata@v-corp.inc"
              className="text-sage hover:underline"
            >
              お問い合わせ (arata@v-corp.inc)
            </a>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-wabi bg-white/70 p-5">
        <h2 className="text-sm font-semibold text-ink">セッション</h2>
        <form action="/auth/sign-out" method="POST" className="mt-3">
          <button
            type="submit"
            className="rounded-full border border-wabi px-4 py-1.5 text-sm text-sumi hover:bg-sage/5"
          >
            ログアウト
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
        <h2 className="text-sm font-semibold text-red-800">
          アカウントの削除
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-sumi">
          アカウントを削除すると、ニックネーム・プロフィール・投稿・うなずき
          などすべてのデータが削除されます。この操作は取り消せません。
        </p>
        <p className="mt-3 text-xs text-sumi">
          削除をご希望の場合は{" "}
          <a
            href="mailto:arata@v-corp.inc?subject=アカウント削除依頼"
            className="text-red-700 underline"
          >
            arata@v-corp.inc
          </a>{" "}
          までご連絡ください。本人確認後、48時間以内に対応します。
        </p>
      </section>
    </div>
  );
}
