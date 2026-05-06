"use client";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Component 用 Supabase クライアント。
 * ブラウザの cookie で認証セッションを維持。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
