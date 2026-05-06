import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWaitingPosts } from "@/lib/listening";
import { ListeningSection } from "@/components/ListeningSection";

export const metadata = {
  title: "そばにいる — よりそい",
  robots: { index: false, follow: false },
};

export default async function ListeningPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [waitingPosts, { data: myEmpathy }, { data: myBookmarks }] =
    await Promise.all([
      getWaitingPosts(supabase, user.id, 50),
      supabase.from("empathy").select("post_id").eq("user_id", user.id),
      supabase.from("bookmarks").select("post_id").eq("user_id", user.id),
    ]);
  const empathySet = new Set((myEmpathy ?? []).map((e) => e.post_id));
  const bookmarkSet = new Set((myBookmarks ?? []).map((b) => b.post_id));

  return (
    <div className="space-y-6">
      <Link
        href="/feed"
        className="inline-flex items-center text-sm text-sumi hover:text-sage"
      >
        ← フィードに戻る
      </Link>

      <header>
        <h1 className="font-display text-2xl text-ink md:text-3xl">
          🌱 あなたの声を、必要としている人がいます
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-sumi">
          まだ返信がついていない、悩み・質問の投稿です。
          <br />
          無理に答えを出さなくても、ひとことうなずくだけでも、
          <br />
          きっとその人にとって大きな意味を持ちます。
        </p>
        <p className="mt-3 rounded-xl bg-sage/5 px-4 py-2 text-xs leading-relaxed text-sumi/80">
          古い順に並んでいます。長く誰にも届いていない声を、優先的に。
        </p>
      </header>

      {waitingPosts.length > 0 ? (
        <ListeningSection
          posts={waitingPosts}
          empathySet={empathySet}
          bookmarkSet={bookmarkSet}
          preview={false}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-wabi p-10 text-center text-sm text-sumi/70">
          今は、返信を待っている投稿はありません。
          <br />
          みんなにすでに、誰かが寄り添っています 🌿
        </div>
      )}
    </div>
  );
}
