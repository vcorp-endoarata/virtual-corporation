# ひとつ (Hitotsu)

> 今日やる 1 つだけ、AI が決めてくれる。

V-Corp の 2 つ目のプロダクト。留年・不登校・通信制・発達特性で「何から手を付けるか」が固まる人のための、AI 学習伴走 SaaS。

## 開発

```bash
cd apps/hitotsu
cp .env.example .env.local
# .env.local に Supabase の URL / anon key を記入
npm install
npm run dev
# → http://localhost:3001
```

## デプロイ

- 本番ドメイン: `https://hitotsu.v-corp.inc` (準備中)
- Vercel プロジェクト: `hitotsu` (Root Directory: `apps/hitotsu`)
- main マージ → 自動デプロイ

## ステータス

- [x] Day 0: Next.js scaffold + Coming Soon LP
- [x] Day 1: Supabase Auth (マジックリンク)
- [ ] Day 2: オンボーディング (状況入力)
- [ ] Day 3: AI が「今日のひとつ」を生成 (Claude Haiku)
- [ ] Day 4: 完了 + 履歴
- [ ] Day 5: Stripe サブスク (¥1,980/月)
- [ ] Day 6: 法務 + ランディング仕上げ
- [ ] Day 7: 公開 + 告知
- [ ] Day 8-14: 5 分タスク分解機能を内蔵

詳細は親リポジトリの `docs/recommendation.md` および `docs/growth-playbook.md` を参照。

## 技術スタック

| レイヤ | 技術 |
|---|---|
| Framework | Next.js 15 (App Router) |
| Style | Tailwind CSS v4 |
| Font | Geist |
| Auth | Supabase Auth (マジックリンク) |
| DB | Supabase Postgres |
| AI | Anthropic Claude Haiku (Day 3〜) |
| 課金 | Stripe Subscriptions (Day 5〜) |
| Hosting | Vercel |

## 必要な環境変数

| 名前 | 値 | 用途 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | https://wzjtkfurgevybfaimjxz.supabase.co | Supabase API の URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sb_publishable_... または legacy anon key | クライアント認証 |
| `NEXT_PUBLIC_SITE_URL` | http://localhost:3001 (dev) / https://hitotsu.v-corp.inc (prod) | マジックリンクのリダイレクト先 |

`anon key` は公開鍵 (ブラウザに配布される) なので Vercel の **Public** 環境変数として設定して OK。

## ルート構成

| パス | 説明 | 認証 |
|---|---|---|
| `/` | LP (Coming Soon + ログイン導線) | 不要 |
| `/login` | メアド入力 → マジックリンク送信 | 不要 (ログイン中なら /app へ転送) |
| `/auth/callback` | マジックリンク受信後の session 確立 | — |
| `/app` | ダッシュボード (ログイン後) | 必要 |

## マジックリンクのフロー

1. ユーザーが `/login` でメアド入力 → server action `signInWithEmail` 実行
2. Supabase が指定メアドにマジックリンクをメール送信
3. ユーザーがメール内リンクをタップ → `/auth/callback?code=xxx` または `?token_hash=xxx&type=magiclink` に着地
4. callback route が `exchangeCodeForSession` または `verifyOtp` で session を確立
5. `/app` (ダッシュボード) にリダイレクト

middleware が全リクエストで session を refresh し、`/app` 配下を未認証時にブロック。
