import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "V-Corp — ひとり と AI で動く、小さな仮想企業";
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
        <span
          style={{
            fontSize: 22,
            color: "#8a9a8e",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontWeight: 400,
          }}
        >
          Virtual Corporation
        </span>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 200,
              color: "#2d3a30",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            V-Corp
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
            ひとり と AI で動く、小さな仮想企業。
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
            v-corp.inc
          </span>
          <span
            style={{
              fontSize: 16,
              color: "#a5b3a8",
              letterSpacing: "0.15em",
              fontWeight: 400,
            }}
          >
            Built solo with AI
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
