import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NEGURA_HOST = "negura.v-corp.inc";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();
  if (host === NEGURA_HOST && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/negura";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
