"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ inviteRequired = false }: { inviteRequired?: boolean }) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/feed";

  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);

    try {
      // Step 1: 招待コード入力されていれば先に検証 → cookie 設定
      if (inviteCode.trim()) {
        const res = await fetch("/api/invite/validate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code: inviteCode.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setState("error");
          setError(data.error ?? "招待コードが無効です");
          return;
        }
      }

      // Step 2: Magic Link 送信 (15s timeout)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "サーバーから応答がありません。しばらくしてからもう一度お試しください。",
              ),
            ),
          15000,
        ),
      );

      const supabase = createClient();
      const result = (await Promise.race([
        supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            shouldCreateUser: true,
          },
        }),
        timeoutPromise,
      ])) as { error: { message: string } | null };

      if (result.error) {
        setState("error");
        setError(result.error.message);
        return;
      }
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    }
  }

  if (state === "sent") {
    return (
      <div
        className="mt-12 rounded-2xl border border-sage/40 bg-sage/5 p-6 text-sm leading-relaxed text-ink"
        role="status"
      >
        <p className="font-semibold text-sage">メールを送信しました ✉</p>
        <p className="mt-3">
          <strong>{email}</strong> 宛にリンクを送りました。
          <br />
          メールを開いて、リンクをタップしてください。
        </p>
        <p className="mt-3 text-xs text-sumi/70">
          • はじめての方は、リンクをタップでアカウント作成が完了します
          <br />
          • 既存ユーザーはそのままログインされます
          <br />
          • メールが届かない場合は迷惑メールフォルダもご確認ください
          <br />
          • リンクは <strong>1時間以内</strong> に <strong>1回だけ</strong> 有効です
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-4 text-xs text-sage underline"
        >
          別のメールアドレスで送り直す
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-12 space-y-4">
      {inviteRequired && (
        <label className="block text-sm font-semibold text-ink">
          招待コード <span className="text-xs text-sumi/60">(新規登録の方のみ)</span>
          <input
            type="text"
            placeholder="yorisoi-xxxxxxxx"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            disabled={state === "sending"}
            autoComplete="off"
            spellCheck={false}
            className="mt-2 block w-full rounded-2xl border border-wabi bg-white px-5 py-3 text-base text-ink outline-none placeholder:text-ink/30 focus:border-sage disabled:opacity-50"
          />
          <span className="mt-1 block text-[11px] leading-relaxed text-sumi/60">
            既にアカウントをお持ちの方は、空欄のまま送信してください。
          </span>
        </label>
      )}

      <label className="block text-sm font-semibold text-ink">
        メールアドレス
        <input
          type="email"
          required
          autoFocus={!inviteRequired}
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "sending"}
          className="mt-2 block w-full rounded-2xl border border-wabi bg-white px-5 py-3 text-base text-ink outline-none placeholder:text-ink/30 focus:border-sage disabled:opacity-50"
        />
      </label>

      <button
        type="submit"
        disabled={state === "sending" || !email}
        className="w-full rounded-2xl bg-sage px-6 py-3 text-base font-semibold text-cream transition hover:opacity-90 disabled:opacity-50"
      >
        {state === "sending" ? "送信中…" : "メールでリンクを受け取る"}
      </button>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
