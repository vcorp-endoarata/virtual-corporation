"use server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CreateProfileInput = {
  userId: string;
  email: string;
  nickname: string;
  role: "self" | "family" | "supporter";
  prefecture: string | null;
  city: string | null;
  bio: string | null;
};

/**
 * 初回 profile 作成 server action。
 * - email を sha256 hash → email_hash として保存 (将来の BAN 再登録防止用)
 * - nickname の重複は DB unique 制約で弾く
 * - 認証済みユーザー本人 (userId === auth.uid) のみ作成可
 */
export async function createOnboardingProfile(input: CreateProfileInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== input.userId) {
    throw new Error("認証情報が一致しません");
  }

  const emailHash = createHash("sha256").update(input.email).digest("hex");

  // service_role で insert (RLS bypass、サーバー側で本人確認済み)
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").insert({
    id: input.userId,
    nickname: input.nickname.trim(),
    role: input.role,
    prefecture: input.prefecture,
    city: input.city,
    bio: input.bio,
    email_hash: emailHash,
  });

  if (error) {
    if (error.code === "23505") {
      // unique violation
      if (error.message.includes("nickname")) {
        throw new Error("そのニックネームは既に使われています");
      }
      throw new Error("既に登録済みです");
    }
    throw new Error(error.message);
  }
}
