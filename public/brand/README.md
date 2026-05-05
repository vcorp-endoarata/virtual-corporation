# Brand Assets

V-Corp ブランドアイコン (ひとつ + V-Corp 共通)。

## ファイル

| ファイル | サイズ | 用途 |
|---|---|---|
| `hitotsu-icon-dark.svg` | 1024×1024 | ひとつ メインアイコン (sage 背景 + cream 円 + sakura dot) |
| `hitotsu-icon-light.svg` | 1024×1024 | ひとつ ライト背景版 (cream 背景 + sage 円 + sakura dot) |
| `vcorp-icon-dark.svg` | 1024×1024 | V-Corp メインアイコン (sage 背景 + cream V) |
| `vcorp-icon-light.svg` | 1024×1024 | V-Corp ライト背景版 (cream 背景 + sage V) |

## デザイン哲学

### ひとつ (○ + ・)
- **円 (open circle)**: 1日のサイクル / 完成 / 静けさ
- **サクラドット (filled dot)**: 「今日の 1 つ」
- 円の中心にドット = 今日が 1 つに集約される、というメッセージ
- テキストフリーで言語非依存、海外展開時もそのまま使える

### V-Corp (V monogram)
- **太いストロークの V**: シンプル・モダン
- ラインキャップ丸めで温かみ
- 角丸スクエアの容器で他ブランドと統一感

## カラーパレット

| 名前 | HEX | 用途 |
|---|---|---|
| sage-700 | `#3a4a3f` | メインの文字色 / ダーク版背景 |
| cream-50 | `#fdfbf5` | ライト版背景 / ダーク版上の文字 |
| sakura-300 | `#e8a8aa` | アクセント (ひとつ のドット、強調) |

## URL (Vercel デプロイ後)

直接ブラウザで開いて確認:
- https://v-corp.inc/brand/hitotsu-icon-dark.svg
- https://v-corp.inc/brand/hitotsu-icon-light.svg
- https://v-corp.inc/brand/vcorp-icon-dark.svg
- https://v-corp.inc/brand/vcorp-icon-light.svg

## PNG への変換 (Stripe アップロード等)

### 方法 A: macOS Preview
1. SVG ファイルをダウンロード or 上記 URL を開く
2. Preview で開く
3. ファイル → 書き出す → フォーマット: PNG → 保存

### 方法 B: オンライン変換
- https://cloudconvert.com/svg-to-png
- https://convertio.co/svg-png/

### 方法 C: コマンドライン (rsvg-convert)
```bash
rsvg-convert -w 512 -h 512 hitotsu-icon-dark.svg -o hitotsu-icon-dark-512.png
```

## Stripe にアップロード

1. https://dashboard.stripe.com/settings/branding
2. **Logo** に上記 PNG (512×512 推奨) をアップロード
3. **Brand color**: `#3a4a3f` (sage)
4. **Accent color**: `#e8a8aa` (sakura)
5. **Save**

ひとつ acct には `hitotsu-icon-dark.svg` を、V-Corp 用 (将来) には `vcorp-icon-dark.svg` を使う。

## 派生 (将来必要なら)

- ワードマーク (テキスト含むロゴ) — 必要時に作成
- 横長バナー (Twitter ヘッダー等) — 必要時に作成
- 透明背景版 — 必要時に作成 (現状は色付き背景のみ)
