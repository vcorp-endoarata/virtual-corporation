# よりそい (yorisoi) — 姉妹プロジェクト情報

> 本リポジトリ (`mrrg32/virtual-corporation`) は **ひとつ** + V-Corp Studio LP を扱う。
> よりそい は **別リポジトリ** (`vcorp-endoarata/V-Corp`) で開発される **姉妹プロジェクト**。
> 親組織 V-Corp の下、Stripe/Vercel team/Resend を一部共有する。
>
> このドキュメントは、AI に「兄弟プロジェクトの存在」を伝えて整合判断できるようにするための参照情報。

最終更新: 2026-05-05

## 概要

- **屋号**: V-Corp
- **代表**: 遠藤新大 (えんどう あらた) (個人事業主、開業届は GW 明け提出予定 / 未提出)
- **連絡先**: hello@yorisoi.community / endoarata24@icloud.com
- **プロダクト名**: よりそい (yorisoi)
- **ドメイン**: <https://yorisoi.community>
- **対象ユーザー**: 発達障害 (ADHD / ASD / トゥレット症候群) を持つ当事者、家族・身近な人、支援者
- **コンセプト**: 「安らぎの場」 — 評価・否定のない、寄り添い合うコミュニティ
- **ビジネスモデル**: 月額 ¥300 サブスクリプション (14 日無料トライアル)、現在ベータ期間中で全機能無料開放

## 技術スタック

| カテゴリ | 採用技術 |
|---|---|
| フレームワーク | Next.js 15.5.15 (App Router, TypeScript) |
| UI | Tailwind CSS (cream/sage パレット, Zen Maru Gothic) |
| DB / Auth / Storage | Supabase (Postgres + Auth + Storage + RLS + Realtime) |
| 認証方式 | Magic Link (PKCE + OTP) |
| 決済 | Stripe Checkout + Webhook |
| メール送信 | Resend (SMTP) |
| ホスティング | Vercel (region: hnd1 / Tokyo) |
| バリデーション | Zod |

## 外部サービス ID

| サービス | ID |
|---|---|
| Vercel project | `prj_XE1uv9OFWTEkSiLGLNyrKiTqWGHb` |
| Vercel team | `team_cdMnCUAiFuUAU0zgnQNWWPFP` (slug: `mrrg32s-projects`) ← ひとつ と共有 |
| Supabase project | `mijpcipoegruzazlkpya` |
| Stripe account | `acct_1TTAh5GbxZSrXZOA` |
| Stripe price | `price_1TTH6IGbxZSrXZOAwCHsYyjv` (¥300/月) |
| GitHub repo | `vcorp-endoarata/V-Corp` |

## 「ひとつ」との対比 (cross-project notes)

| 項目 | よりそい | ひとつ |
|---|---|---|
| ドメイン | yorisoi.community (独立) | hitotsu.v-corp.inc (subdomain) |
| 価格 | ¥300/月 | ¥1,480/月 |
| AI | なし (ピア) | Claude Haiku 4.5 (1on1 伴走) |
| Stripe acct | acct_1TTAh5GbxZSrXZOA | acct_1TTAXKKIix4iiOmw |
| Supabase proj | mijpcipoegruzazlkpya | wzjtkfurgevybfaimjxz |
| GitHub repo | vcorp-endoarata/V-Corp | mrrg32/virtual-corporation |

### 共有リソース (按分対象)
- Resend Pro $20/月 (50/50 按分が妥当)
- Vercel team `mrrg32s-projects`
- Cloudflare DNS

### ひとつ に転用できそうなパターン
- `status` enum でソフト削除 → `daily_tasks` を物理削除しない
- `email_hash` で BAN 後再登録防止
- Realtime で INSERT 購読 → 「親が子の進捗見守り」機能の参考
- `pinned_post_id` → 「今週の小さな一歩」pin の参考

> 詳細スキーマ・ディレクトリ構成・PR 履歴はよりそい本体 repo を参照。
