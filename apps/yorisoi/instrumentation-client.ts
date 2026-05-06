import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // エラーのみ送信 (Performance / Replay は無料枠節約のため OFF)
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    debug: false,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
  });
}

// Next 15 App Router クライアント遷移計測 (現状 traces=0 なので no-op、将来用に export)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
