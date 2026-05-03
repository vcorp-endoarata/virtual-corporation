import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー — V-Corp",
  description: "V-Corp が提供する各サービスにおける個人情報の取扱い方針。",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-100 mb-2">
        プライバシーポリシー
      </h1>
      <p className="text-sm text-neutral-500 mb-12">
        最終改定: 2026年5月3日
      </p>

      <p>
        V-Corp (個人事業主・遠藤 新大、以下「当方」) は、利用者の個人情報を以下の方針に従って取り扱います。
      </p>

      <Section n="1" title="事業者">
        <ul>
          <li>事業者: 個人事業主 遠藤 新大 (屋号: V-Corp)</li>
          <li>連絡先: <a href="mailto:info@v-corp.inc" className="underline">info@v-corp.inc</a></li>
          <li>所在地: お問い合わせをいただいた場合に遅滞なく開示します</li>
        </ul>
      </Section>

      <Section n="2" title="取得する個人情報">
        <p>当方は、本サービスの提供にあたって以下の個人情報を取得することがあります。</p>
        <ul>
          <li>メールアドレス (アカウント登録・ログイン認証時)</li>
          <li>氏名・ニックネーム (利用者が任意で入力)</li>
          <li>サービス利用ログ (アクセス日時、操作履歴、IP アドレス、ブラウザ情報)</li>
          <li>支払い情報 (Stripe を介して取得・処理。当方はカード番号を保持しません)</li>
          <li>各サービス固有の入力データ (例:「ひとつ」におけるタスク・進捗データ)</li>
          <li>お問い合わせ時に利用者が提供した情報</li>
        </ul>
      </Section>

      <Section n="3" title="個人情報の利用目的">
        <p>取得した個人情報は、以下の目的に利用します。</p>
        <ul>
          <li>本サービスの提供・運営・認証</li>
          <li>利用料金の請求・決済処理</li>
          <li>利用者へのサポート・お問い合わせ対応</li>
          <li>本サービスの改善・新機能の検討</li>
          <li>不正利用の検知・防止</li>
          <li>重要なお知らせ・利用規約変更等の通知</li>
        </ul>
      </Section>

      <Section n="4" title="第三者への提供・委託先">
        <p>
          当方は、利用者の同意なく個人情報を第三者に提供することはありません。ただし、本サービスの提供のために以下の事業者に処理を委託しています。
        </p>
        <ul>
          <li>
            <strong>Vercel Inc. (米国)</strong> ── ホスティング・配信
          </li>
          <li>
            <strong>Supabase Inc. (米国)</strong> ── 認証・データベース・ストレージ
          </li>
          <li>
            <strong>Stripe, Inc. (米国)</strong> ── 決済処理 (カード情報を含む)
          </li>
          <li>
            <strong>Anthropic, PBC (米国)</strong> ── 一部サービスにおける AI 推論 (利用者が入力したテキストを含む)
          </li>
        </ul>
        <p>
          これらの委託先はいずれも米国に所在し、利用者の個人情報は米国に越境移転されることがあります。各社は十分なセキュリティ水準を満たしており、当方との委託契約・約款に基づき適切に取り扱われます。
        </p>
      </Section>

      <Section n="5" title="法令に基づく開示">
        <p>
          以下のいずれかに該当する場合、利用者の同意なく個人情報を開示することがあります。
        </p>
        <ul>
          <li>法令に基づく場合</li>
          <li>人の生命・身体・財産の保護のために必要であり、本人の同意を得ることが困難な場合</li>
          <li>裁判所・捜査機関等から正式な要請があった場合</li>
        </ul>
      </Section>

      <Section n="6" title="個人情報の保管と削除">
        <p>
          利用者の個人情報は、利用目的の達成に必要な期間に限って保管します。利用者がアカウントを削除した場合、合理的な期間内に当該個人情報を削除します。ただし、法令により保存義務がある情報 (取引記録等) はこの限りではありません。
        </p>
      </Section>

      <Section n="7" title="利用者の権利">
        <p>
          利用者は、自己の個人情報について以下を当方に請求できます。
        </p>
        <ul>
          <li>開示</li>
          <li>訂正・追加・削除</li>
          <li>利用停止・第三者提供の停止</li>
        </ul>
        <p>
          請求は <a href="mailto:info@v-corp.inc" className="underline">info@v-corp.inc</a> までご連絡ください。本人確認のうえ、合理的な期間内 (原則 14 日以内) に対応します。
        </p>
      </Section>

      <Section n="8" title="Cookie および類似技術">
        <p>
          本サービスはログイン状態の維持・利用解析のために Cookie および類似技術 (LocalStorage 等) を利用します。利用者はブラウザ設定でこれらを無効化できますが、その場合一部機能が利用できなくなることがあります。
        </p>
      </Section>

      <Section n="9" title="アクセス解析">
        <p>
          本サービスは、サービス改善のために匿名化されたアクセス情報を収集する解析ツール (Vercel Analytics 等) を利用することがあります。これらは個人を特定する形では情報を取得しません。
        </p>
      </Section>

      <Section n="10" title="未成年者からの情報取得">
        <p>
          15 歳未満の利用者の個人情報を取得する場合は、保護者の同意を必要とします。保護者の同意なく取得したことが判明した場合は、速やかに削除します。
        </p>
      </Section>

      <Section n="11" title="セキュリティ対策">
        <p>
          当方は個人情報への不正アクセス・紛失・破壊・改ざん・漏えい等を防ぐため、以下を含む合理的な安全管理措置を講じます。
        </p>
        <ul>
          <li>通信の HTTPS 暗号化</li>
          <li>データベース・ストレージへの最小権限アクセス制御</li>
          <li>認証・パスワードレスログイン</li>
          <li>委託先の安全管理水準の確認</li>
        </ul>
      </Section>

      <Section n="12" title="本ポリシーの変更">
        <p>
          当方は本ポリシーを必要に応じて変更します。重要な変更については本サービス内またはウェブサイト上で事前に通知します。
        </p>
      </Section>

      <Section n="13" title="お問い合わせ">
        <p>
          本ポリシー・個人情報の取扱いに関するお問い合わせは以下までお願いします。
        </p>
        <p className="mt-2">
          メール: <a href="mailto:info@v-corp.inc" className="underline">info@v-corp.inc</a>
        </p>
      </Section>
    </>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-neutral-100 mb-4">
        <span className="text-neutral-600 mr-3 tabular-nums">{n}.</span>
        {title}
      </h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_a]:text-neutral-100">
        {children}
      </div>
    </section>
  );
}
