import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-900">
        <div className="mx-auto max-w-2xl px-6 sm:px-12 py-5 flex items-center justify-between gap-4">
          <Link
            href="/app"
            className="text-xs tracking-[0.3em] text-neutral-400 uppercase hover:text-neutral-100 transition-colors"
          >
            ひとつ
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-500 truncate max-w-[200px]">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-neutral-400 hover:text-neutral-100 transition-colors"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-6 sm:px-12 py-12">{children}</div>
    </div>
  );
}
