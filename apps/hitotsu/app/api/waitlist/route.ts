import { NextResponse, type NextRequest } from "next/server";
import { addToWaitlist } from "@/lib/invite";

const SOURCES = ["lp", "login", "x", "referral", "other"] as const;
type Source = (typeof SOURCES)[number];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "リクエストの形式が正しくありません。" },
      { status: 400 },
    );
  }

  const email =
    body && typeof body === "object" && "email" in body
      ? String((body as { email: unknown }).email ?? "").trim()
      : "";

  const sourceRaw =
    body && typeof body === "object" && "source" in body
      ? String((body as { source: unknown }).source ?? "")
      : "lp";

  const source: Source = (SOURCES as readonly string[]).includes(sourceRaw)
    ? (sourceRaw as Source)
    : "lp";

  if (!email || !email.includes("@") || email.length > 254) {
    return NextResponse.json(
      { error: "invalid_email", message: "メールアドレスの形式が正しくありません。" },
      { status: 400 },
    );
  }

  const result = await addToWaitlist(email, source);
  if (!result.ok) {
    return NextResponse.json(
      { error: "internal_error", message: "登録に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
