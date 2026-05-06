"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          padding: "3rem 1.5rem",
          background: "#FAF6EE",
          color: "#2A2422",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          🌿 一時的にエラーが発生しました
        </h1>
        <p style={{ marginTop: "1rem", color: "#3D3733" }}>
          ご迷惑をおかけしています。しばらくしてからもう一度お試しください。
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <a href="/feed" style={{ color: "#7A9C86" }}>
            フィードに戻る
          </a>
        </p>
      </body>
    </html>
  );
}
