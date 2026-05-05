import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#3a4a3f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px",
          color: "#fdfbf5",
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          fontFamily: "system-ui",
        }}
      >
        V
      </div>
    ),
    { ...size },
  );
}
