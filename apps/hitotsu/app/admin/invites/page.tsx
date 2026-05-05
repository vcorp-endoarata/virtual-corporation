import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { listCodes, listWaitlist, INVITE_REQUIRED } from "@/lib/invite";
import { SubmitButton } from "@/components/submit-button";
import {
  batchInviteAction,
  generateCodeAction,
  inviteEntryAction,
} from "./actions";

export const metadata: Metadata = {
  title: "招待管理 — ひとつ Admin",
};

type SearchParams = Promise<{
  invited?: string;
  batch?: string;
  error?: string;
}>;

export default async function AdminInvitesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    redirect("/login");
  }

  const sp = await searchParams;
  const [codes, waitlist] = await Promise.all([
    listCodes(50),
    listWaitlist({ limit: 100 }),
  ]);

  const unusedCodes = codes.filter((c) => !c.used_at);
  const usedCodes = codes.filter((c) => c.used_at);
  const uninvited = waitlist.filter((w) => !w.invited_at);
  const invited = waitlist.filter((w) => w.invited_at);

  return (
    <main className="min-h-screen px-6 py-12 sm:px-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <Link
            href="/app"
            className="text-xs tracking-[0.3em] text-sakura-300 uppercase hover:text-sage-700 transition-colors"
          >
            ← ダッシュボード
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-sage-900">
            招待管理
          </h1>
          <p className="mt-3 text-sm text-sage-500">
            INVITE_REQUIRED:{" "}
            <strong
              className={
                INVITE_REQUIRED ? "text-sage-900" : "text-sage-400"
              }
            >
              {INVITE_REQUIRED ? "true (招待制 ON)" : "false (誰でも登録可)"}
            </strong>
          </p>
        </header>

        {sp.invited && (
          <div className="mb-8 rounded-lg border border-sage-300 bg-sage-100 px-5 py-4 text-sm text-sage-900">
            ✓ {decodeURIComponent(sp.invited)} に招待を送信しました。
          </div>
        )}
        {sp.batch && (
          <div className="mb-8 rounded-lg border border-sage-300 bg-sage-100 px-5 py-4 text-sm text-sage-900">
            ✓ {sp.batch} 件にバッチ招待を送信しました。
          </div>
        )}
        {sp.error && (
          <div className="mb-8 rounded-lg border border-sakura-300 bg-sakura-100 px-5 py-4 text-sm text-sage-800">
            エラー: {decodeURIComponent(sp.error)}
          </div>
        )}

        {/* セクション 1: コード発行 */}
        <Section title="コードを発行 (X リプライ用)">
          <form action={generateCodeAction} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-sage-500 mb-1">source</label>
              <select
                name="source"
                defaultValue="x_reply"
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-md text-sm"
              >
                <option value="x_reply">x_reply</option>
                <option value="manual">manual</option>
                <option value="founder">founder</option>
              </select>
            </div>
            <div className="flex-[2] min-w-[200px]">
              <label className="block text-xs text-sage-500 mb-1">
                note (任意、X ハンドル等)
              </label>
              <input
                name="note"
                type="text"
                placeholder="@username"
                className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-md text-sm"
              />
            </div>
            <SubmitButton
              pendingText="発行中..."
              className="px-5 py-2 bg-sage-700 text-cream-50 rounded-md text-sm font-medium hover:bg-sage-800"
            >
              コードを発行
            </SubmitButton>
          </form>
        </Section>

        {/* セクション 2: 未使用コード一覧 */}
        <Section title={`未使用コード (${unusedCodes.length})`}>
          {unusedCodes.length === 0 ? (
            <p className="text-sm text-sage-400">未使用のコードはありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream-100 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">code</th>
                    <th className="px-3 py-2 font-medium">source</th>
                    <th className="px-3 py-2 font-medium">note</th>
                    <th className="px-3 py-2 font-medium">created_at</th>
                  </tr>
                </thead>
                <tbody>
                  {unusedCodes.map((c) => (
                    <tr key={c.code} className="border-b border-cream-100">
                      <td className="px-3 py-2 font-mono text-sage-900">
                        {c.code}
                      </td>
                      <td className="px-3 py-2 text-sage-600">{c.source}</td>
                      <td className="px-3 py-2 text-sage-600">{c.note ?? "—"}</td>
                      <td className="px-3 py-2 text-sage-400 text-xs tabular-nums">
                        {formatDate(c.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* セクション 3: ウェイトリスト (未招待) */}
        <Section title={`ウェイトリスト 未招待 (${uninvited.length})`}>
          {uninvited.length > 0 && (
            <form action={batchInviteAction} className="mb-5 flex gap-2 items-center">
              <label className="text-sm text-sage-700">
                古い順から{" "}
                <input
                  name="count"
                  type="number"
                  min={1}
                  max={50}
                  defaultValue={5}
                  className="w-16 px-2 py-1 bg-cream-50 border border-cream-300 rounded text-sm tabular-nums"
                />{" "}
                件招待
              </label>
              <SubmitButton
                pendingText="送信中..."
                className="px-4 py-1.5 bg-sage-700 text-cream-50 rounded text-sm font-medium hover:bg-sage-800"
              >
                バッチ招待
              </SubmitButton>
            </form>
          )}
          {uninvited.length === 0 ? (
            <p className="text-sm text-sage-400">未招待のエントリはありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream-100 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">email</th>
                    <th className="px-3 py-2 font-medium">source</th>
                    <th className="px-3 py-2 font-medium">created_at</th>
                    <th className="px-3 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {uninvited.map((w) => (
                    <tr key={w.id} className="border-b border-cream-100">
                      <td className="px-3 py-2 text-sage-900">{w.email}</td>
                      <td className="px-3 py-2 text-sage-600">{w.source}</td>
                      <td className="px-3 py-2 text-sage-400 text-xs tabular-nums">
                        {formatDate(w.created_at)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <form action={inviteEntryAction}>
                          <input type="hidden" name="entry_id" value={w.id} />
                          <SubmitButton
                            pendingText="..."
                            className="px-3 py-1 bg-sage-700 text-cream-50 rounded text-xs font-medium hover:bg-sage-800"
                          >
                            招待
                          </SubmitButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* セクション 4: 使用済 / 招待済 (折りたたみ) */}
        <Section title={`使用済コード (${usedCodes.length}) / 招待済 (${invited.length})`}>
          <details className="text-sm text-sage-600 cursor-pointer">
            <summary className="text-sage-700 hover:text-sage-900">
              展開して表示
            </summary>
            <div className="mt-4 space-y-6">
              {usedCodes.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-sage-400 mb-2">
                    使用済コード
                  </p>
                  <ul className="space-y-1 text-xs">
                    {usedCodes.slice(0, 20).map((c) => (
                      <li key={c.code} className="font-mono">
                        {c.code} — used at {formatDate(c.used_at!)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {invited.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-sage-400 mb-2">
                    招待済 (ウェイトリスト)
                  </p>
                  <ul className="space-y-1 text-xs">
                    {invited.slice(0, 20).map((w) => (
                      <li key={w.id}>
                        {w.email} — invited at {formatDate(w.invited_at!)} (
                        <span className="font-mono">{w.invited_code}</span>)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 border border-cream-300 rounded-xl p-6 bg-cream-50">
      <h2 className="text-sm font-semibold text-sage-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
