import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "よりそい — 発達障害に悩む人々の、安らぎの場";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 日本語フォント (Zen Maru Gothic) を text-subset で取得
async function loadFont(text: string, weight: 400 | 500 | 700) {
  const url = new URL("https://fonts.googleapis.com/css2");
  url.searchParams.set("family", `Zen Maru Gothic:wght@${weight}`);
  url.searchParams.set("text", text);
  url.searchParams.set("display", "swap");

  const cssRes = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
  });
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format/);
  if (!match) throw new Error("Font URL not found in CSS");
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

export default async function OpengraphImage() {
  // 必要な文字だけサブセット読み込み (高速化)
  const allText = "安らぎの場よりそい発達障害に悩む人々の、yorisoicommunity";

  const [bold, regular] = await Promise.all([
    loadFont(allText, 700),
    loadFont(allText, 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #FAF6EE 0%, #EFE7D8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          fontFamily: "ZenMaru",
          position: "relative",
        }}
      >
        {/* 背景にうっすら丸い形 (柔らかさ表現) */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "rgba(122, 156, 134, 0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(232, 180, 184, 0.10)",
          }}
        />

        {/* "安 ら ぎ の 場" — 上の小ラベル */}
        <div
          style={{
            color: "#7A9C86",
            fontSize: 36,
            fontWeight: 400,
            letterSpacing: 16,
            display: "flex",
          }}
        >
          安らぎの場
        </div>

        {/* メイン: よりそい */}
        <div
          style={{
            color: "#2A2422",
            fontSize: 220,
            fontWeight: 700,
            marginTop: 30,
            letterSpacing: 12,
            display: "flex",
            lineHeight: 1.0,
          }}
        >
          よりそい
        </div>

        {/* タグライン */}
        <div
          style={{
            color: "#3D3733",
            fontSize: 38,
            fontWeight: 400,
            marginTop: 50,
            letterSpacing: 4,
            display: "flex",
          }}
        >
          発達障害に悩む人々の、安らぎの場
        </div>

        {/* URL */}
        <div
          style={{
            color: "#7A9C86",
            fontSize: 28,
            fontWeight: 400,
            marginTop: 70,
            letterSpacing: 2,
            opacity: 0.75,
            display: "flex",
          }}
        >
          yorisoi.community
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "ZenMaru", data: bold, weight: 700, style: "normal" },
        { name: "ZenMaru", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
