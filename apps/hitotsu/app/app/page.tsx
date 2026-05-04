import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ダッシュボード — ひとつ",
};

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-sage-900">
        ようこそ
      </h1>
      <p className="mt-3 text-sage-500">
        ログイン中: <span className="text-sage-800">{user?.email}</span>
      </p>

      <section className="mt-12 border border-cream-300 rounded-xl p-7">
        <p className="text-xs tracking-[0.3em] text-sakura-300 uppercase mb-3">
          Day 1: Auth ✅
        </p>
        <p className="text-sage-800 leading-[1.8]">
          ログインに成功しました。
          <br />
          次のステップ (オンボーディング・今日のひとつ生成) は順次追加されます。
        </p>
      </section>
    </>
  );
}
