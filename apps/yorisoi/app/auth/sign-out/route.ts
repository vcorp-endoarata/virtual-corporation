import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * ログアウト処理。POST のみ受付 (CSRF 安全)。
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${new URL(request.url).origin}/`, {
    status: 303,
  });
}
