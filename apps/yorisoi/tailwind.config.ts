import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 「安らぎの場」 — warm, soft, peaceful palette
        cream: "#FAF6EE",      // 背景: 生成り
        ink: "#2A2422",        // 文字: 暖色系の墨
        sumi: "#3D3733",       // 副: 暖色系の濃い墨
        sage: "#7A9C86",       // アクセント1: 落ち着いたセージグリーン
        sakura: "#E8B4B8",     // アクセント2: 桜色 (うなずき)
        sora: "#A8C5D5",       // アクセント3: 空色 (共感)
        beige: "#D4BFA0",      // 補助色: ベージュ
        wabi: "#EFE7D8",       // ボーダー/区切り: 侘び寂び
      },
      fontFamily: {
        // Zen Maru Gothic を全文体で使用 (見出し・本文ともに丸ゴシック)
        // ASD/ADHD 特性: 単一フォント = 認知負荷最小、優しい曲線 = 安心感
        display: [
          "var(--font-zen-maru-gothic)",
          "'Hiragino Maru Gothic ProN'",
          "'Yu Gothic'",
          "sans-serif",
        ],
        sans: [
          "var(--font-zen-maru-gothic)",
          "'Hiragino Maru Gothic ProN'",
          "'Hiragino Kaku Gothic ProN'",
          "'Yu Gothic'",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
