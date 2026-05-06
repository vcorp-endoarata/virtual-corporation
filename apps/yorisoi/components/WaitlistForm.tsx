"use client";
import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "登録に失敗しました");
      setState("success");
      setMessage(
        "ご登録ありがとうございます。順番が来たら、メールでご招待いたします。",
      );
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "登録に失敗しました");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-2xl border border-wabi bg-white px-5 py-3 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-sage"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="whitespace-nowrap rounded-2xl bg-sage px-6 py-3 text-sm font-semibold text-cream transition hover:opacity-90 disabled:opacity-50"
        >
          {state === "loading" ? "送信中…" : "ウェイトリストに登録"}
        </button>
      </form>
      {message && (
        <p
          className={`mt-3 text-center text-sm ${
            state === "error" ? "text-red-500" : "text-sage"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}
