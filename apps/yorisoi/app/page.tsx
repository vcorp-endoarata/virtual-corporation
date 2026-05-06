import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WaitlistForm } from "@/components/WaitlistForm";
import { isInviteRequired } from "@/lib/invite";

async function getLoggedInUser() {
  // Supabase 接続失敗時でも LP は表示できるように防御
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, ban_until")
      .eq("id", user.id)
      .maybeSingle();
    return { user, profile };
  } catch (err) {
    console.error("[home] Supabase error:", err);
    return null;
  }
}

export default async function HomePage() {
  // ログイン済みなら LP ではなく適切なページへ自動遷移
  const session = await getLoggedInUser();
  if (session) {
    const { profile } = session;
    if (
      profile?.ban_until &&
      new Date(profile.ban_until).getTime() > Date.now()
    ) {
      redirect("/banned");
    }
    if (!profile) {
      redirect("/onboarding");
    }
    redirect("/feed");
  }

  const inviteRequired = isInviteRequired();

  return (
    <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      {/* 右上にログイン導線 */}
      <Link
        href="/login"
        className="absolute right-4 top-4 rounded-full border border-sage/40 bg-white/60 px-4 py-1.5 text-xs font-semibold text-sage hover:bg-sage hover:text-cream md:right-6 md:top-6 md:text-sm"
      >
        ログイン
      </Link>

      <span className="mt-6 rounded-full border border-sage/40 bg-sage/10 px-4 py-1 text-xs tracking-wider text-sage">
        {inviteRequired
          ? "🌱 α 版・招待制で開放中"
          : "2026年 オープン準備中"}
      </span>

      <h1 className="mt-8 font-display text-5xl leading-[1.15] tracking-tight md:text-7xl">
        よりそい
      </h1>

      <p className="mt-4 font-display text-base text-sumi md:text-lg">
        発達障害に悩む人々の <span className="text-sage">安らぎ</span> の場
      </p>

      <p className="mx-auto mt-12 max-w-xl text-sm leading-relaxed text-sumi md:text-base">
        ADHD・ASD・トゥレット症候群 など、発達障害を持つ人と、
        <br />
        その家族・身近な人たちが、
        <br className="hidden md:block" />
        比較せず、攻撃せず、ただ <strong>寄り添える</strong> 場所を作っています。
      </p>

      <section
        id="pricing"
        className="mx-auto mt-12 w-full max-w-md rounded-2xl border-2 border-sage/40 bg-white/60 p-6 text-center"
      >
        <p className="text-xs tracking-widest text-sage">料金プラン</p>
        <p className="mt-2 font-display text-4xl text-ink">
          月額 <span className="text-sage">¥300</span>
        </p>
        <p className="mt-2 text-xs text-sumi/70">
          税込、14日間の無料トライアル付き
        </p>
        <p className="mt-4 text-sm text-sumi">
          <strong>2026年6月1日 (月) サービス開始予定</strong>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-sumi/70">
          ご契約から14日間は無料です。15日目に初回 ¥300 が課金され、
          以降は毎月同日に自動課金されます。
          <br />
          いつでも解約可能。
        </p>
        <p className="mt-4 text-xs">
          <a href="/legal/tokutei" className="text-sage hover:underline">
            特定商取引法に基づく表記 →
          </a>
        </p>
      </section>

      <section
        id="about"
        className="mx-auto mt-8 max-w-md rounded-2xl border border-sage/30 bg-sage/5 p-6 text-left text-sm leading-relaxed"
      >
        <p className="text-xs tracking-widest text-sage">運営者について</p>
        <p className="mt-3 font-semibold text-ink">
          運営者 (遠藤 新大) 自身が、
          <br />
          <span className="text-sage">ADHD・ASD・トゥレット症候群</span> の当事者です。
        </p>
        <p className="mt-2 text-xs text-sumi/80">
          開発・運営には家族にも協力してもらっています。
        </p>
        <p className="mt-4 text-sumi">
          「分かってもらえる場所がない」を、
          <br />
          当事者として、自分自身のために、作りました。
        </p>
      </section>

      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-wabi bg-white/40 p-6 text-left text-sm leading-relaxed text-sumi">
        <p className="font-semibold text-ink">大切にしている設計</p>
        <ul className="mt-3 space-y-2 text-xs">
          <li className="flex gap-2">
            <span className="text-sage">◇</span>
            <span>「いいね」ボタンはありません — 比較はしない</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sage">◇</span>
            <span>「うなずき」「共感」「共有」 — 静かな反応だけ</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sage">◇</span>
            <span>当事者の場 / 家族の場 — 必要に応じて分かれます</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sage">◇</span>
            <span>半匿名 — ニックネームで、本音で書ける</span>
          </li>
          <li className="flex gap-2">
            <span className="text-sage">◇</span>
            <span>攻撃的な発言には、しっかり対応します</span>
          </li>
        </ul>
      </div>

      <div className="mt-16 w-full">
        {inviteRequired ? (
          <>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="rounded-2xl bg-sage px-6 py-3 text-sm font-semibold text-cream hover:opacity-90"
              >
                招待コードでログイン
              </Link>
              <a
                href="#waitlist"
                className="rounded-2xl border border-sage/40 bg-white/60 px-6 py-3 text-sm font-semibold text-sage hover:bg-sage/5"
              >
                ウェイトリストに登録
              </a>
            </div>
            <p className="mt-3 text-xs text-sumi/70">
              正式公開: フォロワー 1,000 人到達時 または 2026/7/1 を予定
            </p>
            <div id="waitlist" className="mt-12">
              <p className="mb-4 text-xs text-sumi">
                招待コードがない方はこちら
              </p>
              <WaitlistForm />
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-xs text-sumi">
              オープン通知を受け取る or{" "}
              <Link href="/login" className="text-sage underline">
                既にアカウントをお持ちの方はログイン
              </Link>
            </p>
            <WaitlistForm />
          </>
        )}
      </div>

      <footer className="mt-24 text-xs text-sumi/60">
        <p>運営: 遠藤 新大</p>
        <p className="mt-2 space-x-3">
          <a href="/support" className="text-sage hover:underline">🌱 サポート</a>
          <a href="/legal/tokutei" className="hover:text-sage">特定商取引法</a>
          <a href="/legal/terms" className="hover:text-sage">利用規約</a>
          <a href="/legal/privacy" className="hover:text-sage">プライバシー</a>
          <a href="mailto:arata@v-corp.inc" className="hover:text-sage">
            お問い合わせ
          </a>
        </p>
      </footer>
    </main>
  );
}
