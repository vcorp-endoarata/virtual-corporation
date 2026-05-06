export const metadata = {
  title: "プライバシーポリシー — よりそい",
  robots: { index: false, follow: false },
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. 事業者情報",
    body: (
      <>
        本ポリシーにおける「当事業者」とは、遠藤 新大 (
        所在地: 〒134-0088 東京都江戸川区西葛西3丁目16番20号 ペルシェール西葛西309)
        をいいます。本サービス「よりそい」の運営において、利用者の個人情報を以下のとおり
        適切に取扱います。
      </>
    ),
  },
  {
    title: "2. 機微情報の特別な配慮",
    body: (
      <>
        本サービスは発達障害を持つ方およびそのご家族・支援者を対象としています。
        利用者が本サービスを利用すること自体が、ご本人の障害状況を示唆する場合があるため、
        当事業者は通常の個人情報以上の慎重な取扱いを行います。
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>登録時に取得する情報は最小限 (メールアドレス、ニックネーム、立場区分のみ) に留めます</li>
          <li>本名・住所・電話番号・生年月日等は登録時に取得しません</li>
          <li>第三者への情報提供は厳格に制限します</li>
          <li>退会時には保有する個人情報を速やかに削除します (法令上の保管義務分を除く)</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. 取得する個人情報",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>メールアドレス (ログイン・通知用)</li>
        <li>ニックネーム (本人特定不可なもの)</li>
        <li>立場区分 (当事者 / 家族・身近 / 支援者、任意)</li>
        <li>都道府県 (任意、コミュニティ機能用)</li>
        <li>クレジットカード情報 (Stripe 経由で処理し、当事業者のサーバーには保存しません)</li>
        <li>本サービス利用ログ (アクセス日時、操作内容、IPアドレス、Cookie 等)</li>
        <li>投稿内容、メディア (写真・動画) — ご本人の意思に基づき投稿された情報</li>
        <li>お問い合わせ時にご提供いただく情報</li>
      </ul>
    ),
  },
  {
    title: "4. 利用目的",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>本サービスの提供・運用・保守</li>
        <li>本人確認、認証、利用料金の請求</li>
        <li>サービス改善・新機能開発のための統計分析 (個人を特定しない形で)</li>
        <li>重要なお知らせ、メンテナンス情報、機能更新の通知</li>
        <li>不正利用・規約違反の検知および対応</li>
        <li>お問い合わせへの対応</li>
        <li>法令に基づく開示・対応</li>
        <li>危機的発言の検知時に、利用者ご自身へ相談先情報を表示するため</li>
      </ul>
    ),
  },
  {
    title: "5. 第三者提供",
    body: (
      <>
        当事業者は、利用者の同意がある場合または法令に基づく場合を除き、取得した個人情報を
        第三者に提供しません。ただし、利用目的の達成に必要な範囲で、以下の業務委託先に
        個人情報の取扱いを委託することがあります:
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Stripe Inc. (米国) — クレジットカード決済処理</li>
          <li>Supabase Inc. (米国) — データベース・認証基盤</li>
          <li>Vercel Inc. (米国) — ウェブホスティング</li>
          <li>Resend, Inc. (米国) — メール配信</li>
        </ul>
      </>
    ),
  },
  {
    title: "6. 安全管理措置",
    body: (
      <>
        当事業者は、取得した個人情報の漏洩、滅失、毀損の防止その他安全管理のため、
        以下の措置を講じます:
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>保管時および通信時の暗号化 (TLS / AES)</li>
          <li>Row Level Security (RLS) によるアクセス権限の最小化</li>
          <li>監査ログの取得と定期的なレビュー</li>
          <li>定期的な脆弱性スキャンと依存ライブラリ更新</li>
          <li>事業者本人以外への開示は原則行いません</li>
        </ul>
      </>
    ),
  },
  {
    title: "7. Cookie および類似技術の使用",
    body: (
      <>
        本サービスでは、利用状況の把握、認証維持、サービス改善のため Cookie および
        類似技術を使用することがあります。ブラウザ設定により Cookie を無効にできますが、
        その場合一部機能が利用できなくなることがあります。
      </>
    ),
  },
  {
    title: "8. 開示・訂正・削除請求",
    body: (
      <>
        利用者は、当事業者が保有する自己の個人情報について、開示、訂正、追加、削除、
        利用停止、第三者提供の停止を請求できます。請求にあたっては、下記お問い合わせ先まで
        ご連絡ください。当事業者は、本人確認の上、合理的な期間内に対応します。
      </>
    ),
  },
  {
    title: "9. 海外への移転",
    body: (
      <>
        本サービスは、米国・EU 等の海外に所在するクラウド事業者を業務委託先として
        利用する場合があります。当該移転は GDPR 等の各法令に準拠した形で行われます。
      </>
    ),
  },
  {
    title: "10. 未成年の方の利用",
    body: (
      <>
        本サービスは18歳以上の方を主な対象としていますが、ご家族の方が18歳未満の
        当事者ご本人の代理として利用する場合は、必ず保護者の同意のもとでご利用ください。
        18歳未満が写る投稿には、追加の保護措置 (内部限定表示、ぼかし推奨など) を講じます。
      </>
    ),
  },
  {
    title: "11. 改定",
    body: (
      <>
        当事業者は、必要に応じて本ポリシーを改定することがあります。重要な変更がある場合、
        利用者へ通知するか、本ページにて告知します。
      </>
    ),
  },
  {
    title: "12. お問い合わせ窓口",
    body: (
      <div className="space-y-1">
        <p>個人情報に関するお問い合わせ:</p>
        <p>
          メール:{" "}
          <a
            href="mailto:arata@v-corp.inc"
            className="text-sage hover:underline"
          >
            arata@v-corp.inc
          </a>
        </p>
        <p>事業者: 遠藤 新大</p>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-ink">
      <a href="/" className="text-sm text-sumi hover:text-sage">
        ← よりそい
      </a>
      <h1 className="mt-6 font-display text-4xl md:text-5xl">
        プライバシーポリシー
      </h1>
      <p className="mt-4 text-sm text-sumi/70">最終更新日: 2026年5月3日</p>

      <div className="mt-12 space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl text-ink">{s.title}</h2>
            <div className="mt-3 text-sm leading-relaxed text-sumi">{s.body}</div>
          </section>
        ))}
      </div>

      <p className="mt-16 text-xs text-sumi/60">制定日: 2026年5月3日</p>

      <div className="mt-12 text-center">
        <a
          href="/"
          className="inline-block rounded-full border border-sage/40 bg-sage/5 px-6 py-2.5 text-sm text-ink transition hover:bg-sage/15"
        >
          ホームに戻る
        </a>
      </div>
    </main>
  );
}
