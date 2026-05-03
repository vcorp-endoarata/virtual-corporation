import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 — V-Corp",
  description:
    "特定商取引法第11条に基づく表記。事業者・販売価格・支払方法・返金等。",
};

export default function TokushohoPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-100 mb-2">
        特定商取引法に基づく表記
      </h1>
      <p className="text-sm text-neutral-500 mb-12">
        最終改定: 2026年5月3日
      </p>

      <p>
        特定商取引法第 11 条 (通信販売についての広告) に基づき、以下のとおり表記します。
      </p>

      <dl className="mt-12 space-y-8">
        <Item label="事業者">
          個人事業主 遠藤 新大 (屋号: V-Corp)
        </Item>

        <Item label="運営責任者">遠藤 新大</Item>

        <Item label="所在地">
          請求があったときは遅滞なく開示します。
          <br />
          <span className="text-neutral-500 text-sm">
            (特定商取引法施行規則第 10 条第 1 項に基づき、本ページ上では非開示としています)
          </span>
        </Item>

        <Item label="電話番号">
          請求があったときは遅滞なく開示します。
          <br />
          <span className="text-neutral-500 text-sm">
            (お問い合わせは原則メールにて承ります)
          </span>
        </Item>

        <Item label="メールアドレス">
          <a href="mailto:info@v-corp.inc" className="underline hover:text-neutral-100">
            info@v-corp.inc
          </a>
        </Item>

        <Item label="販売 URL">
          <ul className="list-disc pl-6 space-y-1">
            <li>https://v-corp.inc</li>
            <li>https://hitotsu.v-corp.inc (準備中)</li>
          </ul>
        </Item>

        <Item label="販売価格">
          各サービスの紹介ページに表示された月額料金 (税込)。
          <br />
          例:「ひとつ」 月額 1,980 円 (税込)
        </Item>

        <Item label="商品代金以外の必要料金">
          通信料は利用者の負担となります。商品代金以外に当方が請求する費用はありません。
        </Item>

        <Item label="支払方法">
          クレジットカード決済 (Stripe を介して処理)。
          <br />
          対応カードブランド: Visa / Mastercard / American Express / JCB / Diners Club / Discover
        </Item>

        <Item label="支払時期">
          初回登録時 (無料試用期間がある場合は試用期間終了時) に当月分が発生し、以後毎月同日に自動更新・課金されます。
        </Item>

        <Item label="サービスの提供時期">
          支払い完了後、即時にサービスを利用いただけます。
        </Item>

        <Item label="返品・返金">
          サービスの性質上、原則として返金は行いません。
          <br />
          ただし、当方の故意または重過失によりサービスが提供できなかった期間については、個別協議のうえ返金等の対応を検討します。
        </Item>

        <Item label="解約">
          利用者はいつでも、サービス内の解約導線より自由に解約できます。解約後も当該課金期間の終了までは引き続き有料機能を利用できます。日割り返金はありません。
        </Item>

        <Item label="動作環境">
          <ul className="list-disc pl-6 space-y-1">
            <li>最新版の Google Chrome / Safari / Firefox / Edge</li>
            <li>iOS Safari (iOS 17 以降推奨)</li>
            <li>Android Chrome (Android 12 以降推奨)</li>
            <li>JavaScript および Cookie が有効であること</li>
          </ul>
        </Item>

        <Item label="表現及び商品に関する注意書き">
          本サービスは、当方が提供するソフトウェア・コンテンツであり、その効果や効能を保証するものではありません。
          特に「ひとつ」を含む学習・自己観察支援サービスは、教育・医療・心理サービスを提供するものではなく、利用者の取り組みや状況によって得られる結果は異なります。
        </Item>
      </dl>
    </>
  );
}

function Item({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs tracking-[0.2em] text-neutral-500 uppercase mb-2">
        {label}
      </dt>
      <dd className="text-neutral-200 leading-[1.9]">{children}</dd>
    </div>
  );
}
