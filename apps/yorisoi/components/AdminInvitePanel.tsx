"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function AdminGenerateButton() {
  const router = useRouter();
  const [count, setCount] = useState(20);
  const [source, setSource] = useState<
    "manual" | "x_reply" | "founder" | "waitlist"
  >("manual");
  const [generated, setGenerated] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/invites/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ count, source }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
        setGenerated(data.codes);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "生成に失敗しました");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="block text-xs text-sumi/70">件数</span>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 20)}
            className="mt-1 w-24 rounded-xl border border-wabi bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="block text-xs text-sumi/70">source</span>
          <select
            value={source}
            onChange={(e) =>
              setSource(
                e.target.value as
                  | "manual"
                  | "x_reply"
                  | "founder"
                  | "waitlist",
              )
            }
            className="mt-1 rounded-xl border border-wabi bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="manual">manual</option>
            <option value="x_reply">x_reply</option>
            <option value="founder">founder</option>
            <option value="waitlist">waitlist</option>
          </select>
        </label>
        <button
          type="button"
          onClick={generate}
          disabled={isPending}
          className="rounded-full bg-sage px-5 py-2 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "生成中…" : `${count} 個生成`}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {generated && (
        <div className="rounded-xl bg-sage/5 p-3">
          <p className="text-xs text-sumi">
            ✓ {generated.length} 個生成しました
          </p>
          <div className="mt-2 grid grid-cols-1 gap-1 font-mono text-xs sm:grid-cols-2">
            {generated.map((c) => (
              <CopyableCode key={c} code={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminInviteWaitlistButton() {
  const router = useRouter();
  const [count, setCount] = useState(10);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function invite() {
    if (
      !confirm(
        `先頭 ${count} 人にメール招待を送信します。よろしいですか?`,
      )
    )
      return;

    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/waitlist/invite", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ count }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "送信に失敗しました");
        setResult({ sent: data.sent, failed: data.failed });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "送信に失敗しました");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="block text-xs text-sumi/70">人数</span>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 10)}
            className="mt-1 w-24 rounded-xl border border-wabi bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <button
          type="button"
          onClick={invite}
          disabled={isPending}
          className="rounded-full bg-sage px-5 py-2 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "送信中…" : `先頭 ${count} 人に招待を送る`}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {result && (
        <p className="text-xs text-sumi">
          ✓ 送信完了: {result.sent} 件 / 失敗: {result.failed} 件
        </p>
      )}
    </div>
  );
}

export function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="rounded bg-white px-2 py-1 text-left text-xs text-ink hover:bg-sage/10"
      title="クリックでコピー"
    >
      {copied ? "✓ コピーしました" : code}
    </button>
  );
}
