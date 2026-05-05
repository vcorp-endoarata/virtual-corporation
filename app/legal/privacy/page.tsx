import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー — V-Corp",
  description: "V-Corp が提供する各サービスにおける個人情報の取扱い方針。",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-sage-900 mb-2">
        プライバシーポリシー
      </h1>
      <p className="text-sm text-sage-400 mb-12">
        制定日: 2026 年 5 月 5 日 / 最終改定日: 2026 年 5 月 5 日
      </p>

      <p>
        V-Corp (個人事業主・遠藤 新大、以下「当方」といいます) は、当方が提供するサービス (「ひとつ」その他、以下「本サービス」と総称します) における利用者の個人情報の取扱いについて、以下のとおりプライバシーポリシーを定めます。
      </p>

      <Section n="1" title="取得する情報">
        <p>本サービスの提供にあたり、以下の情報を取得します。</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-cream-200 mt-2">
            <thead className="bg-cream-100">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-sage-900 border-b border-cream-200">項目</th>
                <th className="text-left px-3 py-2 font-medium text-sage-900 border-b border-cream-200">取得方法</th>
                <th className="text-left px-3 py-2 font-medium text-sage-900 border-b border-cream-200">用途</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 align-top border-b border-cream-200">メールアドレス</td>
                <td className="px-3 py-2 align-top border-b border-cream-200">利用者の登録</td>
                <td className="px-3 py-2 align-top border-b border-cream-200">認証 (Magic Link)、重要なお知らせ送信</td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top border-b border-cream-200">利用者の入力データ (現在の状況、目標、1 日に使える時間、苦手なこと、タスク完了履歴)</td>
                <td className="px-3 py-2 align-top border-b border-cream-200">利用者の操作</td>
                <td className="px-3 py-2 align-top border-b border-cream-200">「今日のひとつ」の AI 提案生成、サービス内表示</td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top border-b border-cream-200">決済情報 (カード番号は当方では保持しません)</td>
                <td className="px-3 py-2 align-top border-b border-cream-200">Stripe 経由</td>
                <td className="px-3 py-2 align-top border-b border-cream-200">課金処理</td>
              </tr>
              <tr>
                <td className="px-3 py-2 align-top">アクセスログ、Cookie、IP アドレス、ブラウザ情報</td>
                <td className="px-3 py-2 align-top">自動取得</td>
                <td className="px-3 py-2 align-top">不正利用防止、サービス改善</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="2" title="利用目的">
        <p>取得した個人情報は、以下の目的のために利用します。</p>
        <ol className="list-decimal pl-6 space-y-1.5">
          <li>本サービスの提供・運営、認証</li>
          <li>利用者からの問い合わせ対応</li>
          <li>利用規約に違反する行為への対応</li>
          <li>AI モデルによる機能提供 (「ひとつ」におけるタスク提案生成)</li>
          <li>決済処理 (Stripe)</li>
          <li>メールによる重要なお知らせ送信 (システム通知、規約変更等)</li>
          <li>統計データの作成 (個人を特定できない形式に加工)</li>
        </ol>
      </Section>

      <Section n="3" title="第三者への提供">
        <p>
          本サービスは、以下の第三者に個人情報を提供する場合があります。利用者は本ポリシーに同意することにより、これらへの提供に同意したものとみなします。いずれも米国に所在するため、利用者の個人情報は米国へ越境移転されます。
        </p>

        <h3 className="mt-6 text-base font-semibold text-sage-900">3.1 認証・データ基盤</h3>
        <ul>
          <li><strong>提供先</strong>: Supabase, Inc. (米国)</li>
          <li><strong>提供データ</strong>: メールアドレス、認証セッション、本サービス内で利用者が入力したすべてのデータ</li>
          <li><strong>目的</strong>: 認証、データベースおよびストレージの提供</li>
          <li><strong>保護措置</strong>: 同社のセキュリティ対策・プライバシーポリシーに準拠</li>
        </ul>

        <h3 className="mt-6 text-base font-semibold text-sage-900">3.2 ホスティング</h3>
        <ul>
          <li><strong>提供先</strong>: Vercel, Inc. (米国)</li>
          <li><strong>提供データ</strong>: アクセスログ、IP アドレス</li>
          <li><strong>目的</strong>: ウェブサイトの配信</li>
          <li><strong>保護措置</strong>: 同社のプライバシーポリシーに準拠</li>
        </ul>

        <h3 className="mt-6 text-base font-semibold text-sage-900">3.3 決済</h3>
        <ul>
          <li><strong>提供先</strong>: Stripe, Inc. (米国 / 日本)</li>
          <li><strong>提供データ</strong>: メールアドレス、決済関連情報</li>
          <li><strong>目的</strong>: 課金処理</li>
          <li><strong>保護措置</strong>: PCI DSS Level 1 準拠</li>
        </ul>

        <h3 className="mt-6 text-base font-semibold text-sage-900">3.4 メール送信</h3>
        <ul>
          <li><strong>提供先</strong>: Resend, Inc. (米国)</li>
          <li><strong>提供データ</strong>: メールアドレス、送信内容</li>
          <li><strong>目的</strong>: 認証メール、通知メールの送信</li>
          <li><strong>保護措置</strong>: 同社のセキュリティ対策に準拠</li>
        </ul>

        <h3 className="mt-6 text-base font-semibold text-sage-900">3.5 AI 処理 (Anthropic)</h3>
        <ul>
          <li><strong>提供先</strong>: Anthropic, PBC (米国)</li>
          <li><strong>提供データ</strong>: 「ひとつ」において、利用者が入力した現在の状況・目標・苦手なこと・1 日に使える時間、および過去 14 日分のタスク履歴 (タイトル・完了状況)</li>
          <li><strong>目的</strong>: AI による「今日のひとつ」タスク提案生成</li>
          <li>
            <strong>学習への利用</strong>: Anthropic との API 利用規約により、当方が API 経由で送信するデータは Anthropic のモデル学習には利用されません (デフォルト opt-out 設定)
          </li>
          <li><strong>保管期間</strong>: API 経由のみで処理され、生成完了後は原則として 30 日以内に Anthropic 側で削除されます</li>
          <li><strong>提供しない情報</strong>: メールアドレス、氏名、決済情報など利用者を直接特定する個人情報は Anthropic へ送信しません</li>
          <li>
            <strong>保護措置</strong>: 同社の{" "}
            <a href="https://www.anthropic.com/legal/commercial-terms" target="_blank" rel="noreferrer" className="underline">商用利用規約</a>
            {" "}および{" "}
            <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer" className="underline">プライバシーポリシー</a>
            {" "}に準拠
          </li>
        </ul>

        <h3 className="mt-6 text-base font-semibold text-sage-900">3.6 法令に基づく開示</h3>
        <ul>
          <li>法令に基づく開示請求があった場合</li>
          <li>人の生命、身体または財産の保護のために必要であり、本人の同意を得ることが困難である場合</li>
          <li>裁判所・捜査機関等から正式な要請があった場合</li>
        </ul>
      </Section>

      <Section n="4" title="保管期間">
        <ul>
          <li>
            <strong>アカウント情報・利用データ</strong>: 利用者がアカウントを削除した時点で、合理的な期間内 (90 日以内) に削除します。ただし、法令上保存が義務付けられているデータ (取引記録等)、および紛争・不正利用調査のため保持する必要があるデータはこの限りではありません。
          </li>
          <li>
            <strong>アクセスログ</strong>: 取得から 90 日以内に削除または匿名化します。
          </li>
        </ul>
      </Section>

      <Section n="5" title="利用者の権利">
        <p>
          利用者は、当方が保有する自己の個人情報について、以下の権利を行使できます。
        </p>
        <ul>
          <li>開示請求</li>
          <li>訂正・追加・削除請求</li>
          <li>利用停止・消去・第三者提供の停止請求</li>
        </ul>
        <p>
          請求は <a href="mailto:info@v-corp.inc" className="underline">info@v-corp.inc</a> までご連絡ください。本人確認のうえ、合理的な期間内 (原則 14 日以内) に対応します。
        </p>
      </Section>

      <Section n="6" title="安全管理措置">
        <p>
          当方は、個人情報の漏洩、滅失、毀損を防止するため、以下の措置を講じます。
        </p>
        <ul>
          <li>データの暗号化 (転送時 HTTPS、保管時は Supabase の暗号化機能を利用)</li>
          <li>アクセス制御 (Supabase Row Level Security によるユーザー単位のアクセス制御)</li>
          <li>定期的なセキュリティアップデート</li>
          <li>不正アクセス監視</li>
          <li>認証・パスワードレスログイン</li>
          <li>委託先の安全管理水準の確認</li>
        </ul>
      </Section>

      <Section n="7" title="Cookie の利用">
        <p>
          本サービスは、認証セッションの維持および利用解析のために必要な Cookie および類似技術 (LocalStorage 等) を使用します。広告目的や第三者トラッキングのための Cookie は使用しません。利用者はブラウザ設定で Cookie を無効化できますが、その場合一部機能が利用できなくなることがあります。
        </p>
      </Section>

      <Section n="8" title="お子様の利用">
        <p>
          本サービスは原則として 13 歳以上の方を対象としています。13 歳未満の方は、保護者の同意のうえご利用ください。保護者の同意なく取得したことが判明した場合は、速やかに削除します。
        </p>
      </Section>

      <Section n="9" title="プライバシーポリシーの変更">
        <p>
          当方は、必要に応じて本ポリシーを変更します。重要な変更の場合は、本サービス上での告知またはメールによりお知らせします。
        </p>
      </Section>

      <Section n="10" title="お問い合わせ窓口">
        <p>
          個人情報の取扱いに関するお問い合わせは、以下までご連絡ください。
        </p>
        <ul>
          <li><strong>屋号</strong>: V-Corp</li>
          <li><strong>代表者</strong>: 遠藤 新大</li>
          <li><strong>メール</strong>: <a href="mailto:info@v-corp.inc" className="underline">info@v-corp.inc</a></li>
        </ul>
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
      <h2 className="text-lg font-semibold text-sage-900 mb-4">
        <span className="text-sage-300 mr-3 tabular-nums">{n}.</span>
        {title}
      </h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_a]:text-sage-900">
        {children}
      </div>
    </section>
  );
}
