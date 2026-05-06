export const metadata = {
  title: "特定商取引法に基づく表記 — よりそい",
  robots: { index: false, follow: false },
};

const ROWS: [string, React.ReactNode][] = [
  ["販売事業者の名称", "遠藤 新大"],
  ["運営責任者", "遠藤 新大"],
  [
    "所在地",
    "〒134-0088 東京都江戸川区西葛西3丁目16番20号 ペルシェール西葛西309",
  ],
  ["電話番号", "070-9198-3232"],
  [
    "受付時間",
    "平日 10:00 - 18:00 (土日祝・年末年始を除く)。お急ぎでない場合はメールフォームをご利用ください",
  ],
  [
    "メールアドレス",
    <a
      key="m"
      className="text-sage hover:underline"
      href="mailto:arata@v-corp.inc"
    >
      arata@v-corp.inc
    </a>,
  ],
  [
    "サービス内容",
    "発達障害を持つ方およびその家族・支援者向けのコミュニティアプリ「よりそい」の提供",
  ],
  [
    "販売価格",
    "月額 ¥300 (税込)。サービス開始時点で変更となる場合は事前に告知します",
  ],
  [
    "商品代金以外の必要料金",
    "お客様の利用環境に応じた通信費 / 銀行振込時の振込手数料 (お客様負担)",
  ],
  [
    "支払方法",
    "クレジットカード決済 (Stripe Inc. を通じて Visa / Mastercard / JCB / American Express / Diners Club に対応)",
  ],
  ["支払時期", "月次サブスクリプション。14日間の無料トライアル終了時に初回課金、以降は毎月同日に自動課金"],
  [
    "サービス提供時期",
    "決済完了後、即時にサービスへのアクセス権を発行します",
  ],
  [
    "解約・返金",
    "いつでも解約可能です。解約された場合、当該課金期間の終了をもってサービス利用を停止します。日割りでの返金はいたしません。当社の責に帰すべき重大な不具合が発生した場合は、個別にご相談の上、適切に対応します。",
  ],
  [
    "動作環境",
    "最新版の Google Chrome / Mozilla Firefox / Safari / Microsoft Edge、および主要モバイルブラウザ",
  ],
];

export default function TokuteiPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-ink">
      <a href="/" className="text-sm text-sumi hover:text-sage">
        ← よりそい
      </a>
      <h1 className="mt-6 font-display text-4xl md:text-5xl">
        特定商取引法に基づく表記
      </h1>
      <p className="mt-4 text-sm text-sumi/70">最終更新日: 2026年5月5日</p>

      <dl className="mt-12 divide-y divide-wabi border-y border-wabi">
        {ROWS.map(([term, def]) => (
          <div
            key={term}
            className="grid grid-cols-1 gap-2 py-5 md:grid-cols-[220px,1fr] md:gap-6"
          >
            <dt className="text-sm font-semibold text-ink">{term}</dt>
            <dd className="text-sm leading-relaxed text-sumi">{def}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-12 text-xs leading-relaxed text-sumi/60">
        本表記は特定商取引に関する法律 (昭和51年法律第57号) 第11条および
        同法施行規則第8条に基づき表示しています。
      </p>

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
