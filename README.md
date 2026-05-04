# V-Corp (Virtual Corporation)

> 19歳・高校1年・留年3年・ADHD+トゥレット症候群・趣味は AI のみ。
> その状態から **ウェブアプリ + サブスクで月収を作る** ための個人プロジェクト。

> 1 プロダクトではなく、**複数の小さな SaaS を並走させる「ソロ・スタジオ型」** 運営。

## 何を作るか

「世界に1つの巨大事業」ではなく、**月額 980-1,980円のニッチな SaaS** を、ソロ + AI で作る。
最初の目標は **月 5,000円の MRR (月次経常収益)**。最終目標は月 30万円の MRR。

## 制約と戦い方

| 制約 | 戦い方 |
|---|---|
| 19歳・高1 (社会的信用が薄い) | 法人取引はしない。個人ユーザー向け B2C サブスクのみ。 |
| ADHD (集中の波が大きい) | 1機能・1画面の極小 SaaS。完璧は捨てる。 |
| トゥレット (対人で消耗) | 完全非同期。営業電話・対面ゼロ。 |
| 留年3年 (時間的余裕はある) | 1年積み上げ前提で設計。短期バズに頼らない。 |
| 趣味=AI のみ (= 武器がそれだけ) | AI ネイティブな機能・運用で大手より速く動く。 |

## ユニークな強み (他の起業家にないもの)

1. **AI を毎日触っている** (社会人が研修費を払って学ぶレベルに既にいる)
2. **発達特性の当事者性** (同じ立場の人にだけ見える「困りごと」が分かる)
3. **時間** (1日 2-3時間でも、半年で 400時間)
4. **ブランドドメイン 18 本所有** (`v-corp.inc / .fun / .tokyo / .tech` ほか)

## プロダクト構成

V-Corp は **複数プロダクトを抱えるソロ・スタジオ**。現時点で 2 プロダクト並走。

| プロダクト | 状態 | URL | リポジトリ |
|---|---|---|---|
| **よりそい** (Yorisoi) | Live (¥300/月) | [yorisoi.community](https://yorisoi.community) | `MrRG32/V-Corp` |
| **ひとつ** (Hitotsu) | Coming Soon (¥1,980/月) | hitotsu.v-corp.inc | `MrRG32/hitotsu-app` (予定) |

「よりそい」は希死念慮・絶望のある当事者向けの匿名コミュニティ SNS。
「ひとつ」は留年・不登校・発達特性向けの AI 学習伴走 SaaS。

## ドメイン構成

| ドメイン | 役割 |
|---|---|
| [v-corp.inc](https://v-corp.inc) | V-Corp Studio (親ブランド LP) |
| hitotsu.v-corp.inc | 「ひとつ」(開発中) |
| [yorisoi.community](https://yorisoi.community) | 「よりそい」(独自ドメイン・別管理) |
| v-corp.fun | プロダクト用予備 (現状未使用) |
| v-corp.tokyo | 日本市場向け 2nd LP (Phase 2) |
| その他 15 本 | 用途未定。Day 90 で整理判断 |

## ドキュメント

| パス | 内容 |
|---|---|
| [docs/blue-ocean-analysis.md](docs/blue-ocean-analysis.md) | ソロ × webapp × サブスクで成立する領域の分析 |
| [docs/opportunity-scorecard.md](docs/opportunity-scorecard.md) | 候補プロダクトの定量スコアリング |
| [docs/recommendation.md](docs/recommendation.md) | 推奨プロダクト + 14日で公開する計画 |
| [docs/growth-playbook.md](docs/growth-playbook.md) | 収益を本気で狙うための営業・マーケ施策集 |

## リポジトリ構成 (monorepo)

```
virtual-corporation/
├── app/              # V-Corp Studio LP (https://v-corp.inc)
├── apps/
│   └── hitotsu/      # 「ひとつ」 (https://hitotsu.v-corp.inc)
├── docs/             # 戦略・計画ドキュメント
├── package.json      # Studio LP の依存
└── ...
```

Vercel プロジェクトをアプリ毎に分離 (Root Directory で切り分け) し、独立してデプロイ。
GitHub リポジトリは単一で、PR マージで両アプリの該当箇所が自動デプロイされる。

## ステータス

> 収益は**おまけではなく本気の目標**。`growth-playbook.md` の施策と組み合わせて達成する。

- [x] Phase 0: 戦略再構築 (本ドキュメント)
- [ ] Phase 1: 14日でデプロイ + 決済受付開始 (Day 7 コア / Day 14 タスク分解機能)
- [ ] Phase 2: 最初の有料ユーザー 1人
- [ ] Phase 3: MRR 5,940円 (Pro 3人) — Day 30 目標
- [ ] Phase 4: MRR 79,200円 (Pro 40人) — Day 90 目標
- [ ] Phase 5: MRR 300,000円 (Pro 150人) — Year 1 目標
