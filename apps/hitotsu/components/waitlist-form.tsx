"use client";

import { useState, useTransition } from "react";

type Props = {
  source?: "lp" | "login" | "x" | "referral" | "other";
  className?: string;
};

export function WaitlistForm({ source = "lp", className = "" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setStatus("error");
      setErrorMsg("メールアドレスの形式が正しくありません。");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, source }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          setStatus("error");
          setErrorMsg(data.message ?? "登録に失敗しました。");
          return;
        }
        setStatus("ok");
        setEmail("");
      } catch {
        setStatus("error");
        setErrorMsg("通信に失敗しました。時間をおいて再度お試しください。");
      }
    });
  }

  if (status === "ok") {
    return (
      <div
        className={`rounded-lg border border-sage-300 bg-sage-100 px-5 py-4 ${className}`}
      >
        <p className="text-sm text-sage-900 leading-[1.8]">
          ✓ 登録ありがとうございます。
          <br />
          招待が届き次第、ご連絡いたします。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 bg-cream-50 border border-cream-300 rounded-lg text-sage-900 placeholder-sage-300 focus:outline-none focus:border-sage-500 transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-3 bg-sage-700 text-cream-50 rounded-lg text-sm font-medium hover:bg-sage-800 transition-[transform,opacity] active:scale-[0.98] disabled:cursor-wait disabled:opacity-75 whitespace-nowrap"
        >
          {isPending ? "登録中..." : "ウェイトリスト登録"}
        </button>
      </div>
      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
    </form>
  );
}
