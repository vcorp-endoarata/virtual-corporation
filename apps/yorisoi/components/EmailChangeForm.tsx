"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function EmailChangeForm({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setEditing(false);
    setNewEmail("");
    setError(null);
    setSuccess(null);
  }

  function submit() {
    const trimmed = newEmail.trim();
    if (!trimmed) {
      setError("新しいメールアドレスを入力してください");
      return;
    }
    if (trimmed === currentEmail) {
      setError("現在のメールアドレスと同じです");
      return;
    }
    // 簡易フォーマットチェック (Supabase 側でも検証される)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("メールアドレスの形式が正しくありません");
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        const supabase = createClient();
        const { error: err } = await supabase.auth.updateUser({
          email: trimmed,
        });
        if (err) {
          // よくあるエラー: 既に使用中、レート制限など
          if (
            err.message.toLowerCase().includes("already") ||
            err.message.toLowerCase().includes("registered")
          ) {
            setError("そのメールアドレスは既に使われています");
          } else {
            setError(err.message);
          }
          return;
        }
        setSuccess(trimmed);
        // フォームを閉じてバナー表示モードに
        setEditing(false);
        setNewEmail("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      }
    });
  }

  // 成功直後のメッセージ表示
  if (success) {
    return (
      <div className="rounded-xl border border-sage/40 bg-sage/5 p-3 text-xs leading-relaxed text-ink">
        ✓ 確認メールを <strong>{success}</strong> と現在のアドレスの両方に送信しました。
        <br />
        新しいアドレス側のメール内のリンクをクリックすると、変更が完了します。
        <br />
        <button
          type="button"
          onClick={() => setSuccess(null)}
          className="mt-2 text-[11px] text-sage hover:underline"
        >
          閉じる
        </button>
      </div>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs text-sage hover:underline"
      >
        変更
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-wabi bg-cream/40 p-3">
      <label className="block text-xs font-semibold text-ink">
        新しいメールアドレス
        <input
          type="email"
          autoFocus
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="new@example.com"
          className="mt-1 block w-full rounded-lg border border-wabi bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        />
      </label>
      <p className="text-[11px] leading-relaxed text-sumi/70">
        新しいアドレスに確認メールが届きます。メール内のリンクをクリックすると変更が完了します。
      </p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !newEmail.trim()}
          className="rounded-full bg-sage px-4 py-1.5 text-xs font-semibold text-cream transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "送信中…" : "確認メールを送る"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={isPending}
          className="rounded-full border border-wabi bg-white/70 px-4 py-1.5 text-xs text-sumi hover:bg-sage/5 disabled:opacity-50"
        >
          キャンセル
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
