# ひとつ (Hitotsu)

> 今日やる 1 つだけ、AI が決めてくれる。

V-Corp の 2 つ目のプロダクト。留年・不登校・通信制・発達特性で「何から手を付けるか」が固まる人のための、AI 学習伴走 SaaS。

## 開発

```bash
cd apps/hitotsu
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
- [ ] Day 1: Supabase Auth (Google + メール)
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
| Auth | Supabase Auth |
| DB | Supabase Postgres |
| AI | Anthropic Claude Haiku |
| 課金 | Stripe Subscriptions |
| Hosting | Vercel |
