import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ひとつ — 今日やる 1 つだけ、AI が決めてくれる";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontBold = await fetch(
    new URL(
      "https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansJP-Bold.otf",
    ),
  ).then((res) => res.arrayBuffer());

  const fontRegular = await fetch(
    new URL(
      "https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansJP-Regular.otf",
    ),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5f0e6",
          padding: "80px 96px",
          fontFamily: "NotoSansJP",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 22,
              color: "#e8a8aa",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              fontWeight: 400,
            }}
          >
            by V-Corp
          </span>
          <div
            style={{
              width: 80,
              height: 3,
              background: "#e8a8aa",
              marginTop: 24,
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 220,
              color: "#2d3a30",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            ひとつ
          </div>
          <div
            style={{
              fontSize: 38,
              color: "#5b6b5f",
              marginTop: 28,
              lineHeight: 1.4,
              fontWeight: 400,
            }}
          >
            今日やる 1 つだけ、AI が決めてくれる。
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span style={{ fontSize: 22, color: "#8a9a8e", fontWeight: 400 }}>
            hitotsu.v-corp.inc
          </span>
          <span
            style={{
              fontSize: 16,
              color: "#a5b3a8",
              letterSpacing: "0.15em",
              fontWeight: 400,
            }}
          >
            AI 学習伴走 SaaS
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "NotoSansJP", data: fontBold, weight: 700, style: "normal" },
        {
          name: "NotoSansJP",
          data: fontRegular,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
