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
          position: "relative",
        }}
      >
        {/* Sage background with sakura dot */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#e8a8aa",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
