import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { getSubscription, isActive } from "@/lib/subscription";
import { isAdmin } from "@/lib/admin";
import { checkoutAction, portalAction } from "./actions";

export const metadata: Metadata = {
  title: "登録 — ひとつ",
  description: "「ひとつ」 Pro プランの登録 / 管理。",
};

type SearchParams = Promise<{ checkout?: string; error?: string }>;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const subscription = await getSubscription(user.id);
  const admin = isAdmin(user.email);
  const active = isActive(subscription, user.email);

  const sp = await searchParams;
  const canceled = sp.checkout === "canceled";
  const errMsg = sp.error;

  return (
    <main className="min-h-screen px-6 py-16 sm:px-12 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12">
          <Link
            href="/app"
            className="text-xs tracking-[0.3em] text-sakura-300 uppercase hover:text-sage-700 transition-colors"
          >
            ← ダッシュボード
          </Link>
          <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight text-sage-900">
            {admin ? "Admin (永久無料)" : active ? "登録済み" : "Pro に登録"}
          </h1>
        </header>

        {canceled && (
          <div className="mb-6 rounded-lg border border-cream-300 bg-cream-100 px-5 py-4 text-sm text-sage-700">
            登録をキャンセルしました。いつでも戻ってきてください。
          </div>
        )}
        {errMsg && (
          <div className="mb-6 rounded-lg border border-sakura-300 bg-sakura-100 px-5 py-4 text-sm text-sage-800">
            エラー: {decodeURIComponent(errMsg)}
          </div>
        )}

        {admin ? (
          <AdminCard email={user.email!} />
        ) : active ? (
          <ActiveCard subscription={subscription!} />
        ) : (
          <InactiveCard />
        )}
      </div>
    </main>
  );
}

function AdminCard({ email }: { email: string }) {
  return (
    <section className="border border-sage-300 rounded-xl p-7 bg-sage-100">
      <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
        Admin アカウント
      </p>
      <p className="text-2xl font-semibold tracking-tight text-sage-900">
        全機能を永久に利用可能
      </p>
      <p className="mt-2 text-sm text-sage-700">
        運営者 (V-Corp) のメアドとして登録されているため、課金は発生しません。
      </p>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sage-500">登録メアド</dt>
          <dd className="text-sage-900 font-medium truncate">{email}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sage-500">プラン</dt>
          <dd className="text-sage-900 font-medium">Admin</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sage-500">課金</dt>
          <dd className="text-sage-900 font-medium">なし</dd>
        </div>
      </dl>

      <p className="mt-7 text-xs text-sage-500 leading-[1.8]">
        Admin 権限は環境変数 <code className="text-sage-700">ADMIN_EMAILS</code> で管理されています。
      </p>
    </section>
  );
}

function InactiveCard() {
  return (
    <div className="space-y-7">
      <section className="border border-cream-300 rounded-xl p-7 bg-cream-50">
        <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
          Pro プラン
        </p>
        <p className="text-4xl font-semibold tracking-tight text-sage-900">
          月額 ¥1,480
        </p>
        <p className="mt-2 text-sm text-sage-500">税込、いつでも解約可</p>

        <ul className="mt-7 space-y-3 text-sage-700 leading-[1.9]">
          <li className="flex gap-3">
            <span className="text-sage-400">✓</span>
            <span>
              <strong className="text-sage-900">7 日間無料試用</strong>。
              試用中の解約で課金は発生しません
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-sage-400">✓</span>
            <span>毎日 AI が「今日のひとつ」を生成 (無制限)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-sage-400">✓</span>
            <span>過去の進捗が AI に学習され、提案精度が上がる</span>
          </li>
          <li className="flex gap-3">
            <span className="text-sage-400">✓</span>
            <span>履歴の永続保存</span>
          </li>
          <li className="flex gap-3">
            <span className="text-sage-400">✓</span>
            <span>SNS / 通知 / ガミフィケなし。静かに続けられる設計</span>
          </li>
        </ul>

        <form action={checkoutAction} className="mt-8">
          <button
            type="submit"
            className="w-full py-4 bg-sage-700 text-cream-50 rounded-lg font-medium hover:bg-sage-800 transition-colors"
          >
            7 日間無料で始める →
          </button>
        </form>

        <p className="mt-4 text-xs text-sage-400 leading-[1.8]">
          続行すると Stripe の安全な決済画面に移動します。クレジットカード情報の入力が必要です。
          <br />
          試用期間中はいつでもキャンセルでき、課金は一切発生しません。
        </p>
      </section>

      <section className="text-sm text-sage-500 leading-[1.9] space-y-2">
        <p className="font-medium text-sage-700">よくある質問</p>
        <p>
          <strong>Q. 試用期間中に解約したら?</strong> A. 課金は一切ありません。
        </p>
        <p>
          <strong>Q. 解約はどうやる?</strong> A. このページから「解約する」ボタンで即解約できます。電話・メール不要。
        </p>
        <p>
          <strong>Q. 領収書は出る?</strong> A. Stripe から自動でメール送信されます。
        </p>
        <p className="pt-3">
          <Link
            href="https://v-corp.inc/legal/tokushoho"
            target="_blank"
            rel="noreferrer"
            className="underline text-sage-500 hover:text-sage-900"
          >
            特定商取引法に基づく表記 →
          </Link>
        </p>
      </section>
    </div>
  );
}

function ActiveCard({
  subscription,
}: {
  subscription: NonNullable<Awaited<ReturnType<typeof getSubscription>>>;
}) {
  const trialing = subscription.status === "trialing";
  const cancelAt = subscription.cancel_at_period_end;

  return (
    <div className="space-y-7">
      <section className="border border-sage-300 rounded-xl p-7 bg-sage-100">
        <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
          現在のプラン
        </p>
        <p className="text-2xl font-semibold tracking-tight text-sage-900">
          {trialing ? "Pro (無料試用中)" : "Pro"}
        </p>
        <p className="mt-2 text-sm text-sage-700">
          月額 ¥1,480 (税込)
        </p>

        <dl className="mt-6 space-y-3 text-sm">
          {trialing && subscription.trial_end && (
            <Row
              label="無料試用期間"
              value={`${formatDate(subscription.trial_end)} まで`}
            />
          )}
          {!trialing && subscription.current_period_end && (
            <Row
              label="次回請求日"
              value={formatDate(subscription.current_period_end)}
            />
          )}
          {cancelAt && subscription.current_period_end && (
            <Row
              label="解約予定"
              value={`${formatDate(subscription.current_period_end)} に解約`}
            />
          )}
        </dl>

        <form action={portalAction} className="mt-8">
          <button
            type="submit"
            className="w-full py-3 border border-sage-700 text-sage-700 rounded-lg font-medium hover:bg-sage-700 hover:text-cream-50 transition-colors"
          >
            支払い方法・解約を管理する →
          </button>
        </form>
        <p className="mt-3 text-xs text-sage-500 leading-[1.8]">
          Stripe の管理画面に移動します。解約・支払い方法変更・領収書のダウンロードが可能です。
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sage-500">{label}</dt>
      <dd className="text-sage-900 font-medium">{value}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}
