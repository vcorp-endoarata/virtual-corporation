import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  checkInviteCode,
  isInviteRequired,
  setInviteCookie,
} from "@/lib/invite";

const Body = z.object({
  code: z.string().trim().min(8).max(40),
});

export async function POST(req: Request) {
  if (!isInviteRequired()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "コードの形式が正しくありません" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const result = await checkInviteCode(supabase, parsed.data.code);

  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "この招待コードは存在しません",
      already_used: "この招待コードは既に使われています",
      expired: "この招待コードは有効期限切れです",
    };
    return NextResponse.json(
      { error: messages[result.reason] },
      { status: 400 },
    );
  }

  // 5分の cookie に保持。auth/callback で原子的に redeem する。
  await setInviteCookie(parsed.data.code);

  return NextResponse.json({ ok: true });
}
