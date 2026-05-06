import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const PROTECTED_PREFIXES = [
  "/feed",
  "/post",
  "/profile",
  "/settings",
  "/admin",
];

const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/auth/callback",
  "/auth/sign-out",
  "/legal",
  "/onboarding",
  "/banned",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * 全 request で session を refresh + 保護ルート redirect。
 * Next.js 15 + @supabase/ssr 推奨パターン。
 *
 * 防御策: env vars 欠落や Supabase 接続失敗時に middleware が
 * crash すると Vercel が 500 を返すため、try/catch で落ちないように。
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // env vars が無ければ middleware は何もせず通す
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[middleware] Missing Supabase env vars");
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // IMPORTANT: getUser() で session 自動 refresh
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    // BAN チェック (ログイン済の場合)
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, ban_until")
        .eq("id", user.id)
        .maybeSingle();

      // BAN 中ユーザーは /banned 以外アクセス不可
      if (
        profile?.ban_until &&
        new Date(profile.ban_until).getTime() > Date.now() &&
        pathname !== "/banned" &&
        !pathname.startsWith("/legal") &&
        pathname !== "/auth/sign-out"
      ) {
        url.pathname = "/banned";
        return NextResponse.redirect(url);
      }

      // ログイン済だがプロフィール未作成 → /onboarding 強制
      if (
        !profile &&
        pathname !== "/onboarding" &&
        !pathname.startsWith("/auth/") &&
        !pathname.startsWith("/legal/") &&
        pathname !== "/login"
      ) {
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    }

    // 未ログイン + 保護ルート → /login へ (next= でリダイレクト先保持)
    if (isProtectedPath(pathname) && !user) {
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return response;
  } catch (err) {
    console.error("[middleware] Supabase error:", err);
    // Supabase 不通でも middleware は落とさず、未認証扱いで通す
    return response;
  }
}
