"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MediaUploader } from "@/components/MediaUploader";
import { uploadFile } from "@/lib/storage";

const CATEGORIES = [
  { value: "feeling", label: "🌥 気持ち" },
  { value: "worry", label: "💭 悩み" },
  { value: "experience", label: "✨ 体験" },
  { value: "question", label: "❓ 質問" },
  { value: "celebration", label: "🌱 お祝い" },
  { value: "diary", label: "📝 日記" },
] as const;

export function PostComposer({
  defaultSpace,
  trial,
}: {
  defaultSpace: "self" | "family" | "shared";
  /** 互換性のため残す (未使用) */
  role?: string;
  trial?: {
    isTrial: boolean;
    postsRemaining: number;
    mediaAllowed: boolean;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]["value"] | "">("");
  const space = defaultSpace;
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  const hasMedia = files.length > 0;
  const consentMissing = hasMedia && !consentConfirmed;
  const noContent = body.trim().length === 0 && !hasMedia;
  const categoryMissing = category === "";
  const trialPostBlock = trial?.isTrial && trial.postsRemaining <= 0;
  const trialMediaBlock = trial?.isTrial && !trial.mediaAllowed;
  const hasContent = body.length > 0 || hasMedia || category !== "";

  function reset() {
    if (hasContent && !confirm("入力中の内容を取り消しますか?")) return;
    setBody("");
    setFiles([]);
    setConsentConfirmed(false);
    setCategory("");
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (noContent || consentMissing || categoryMissing) return;

    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            body: body.trim() || "(写真・動画の投稿)",
            category,
            space,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "投稿できませんでした");

        if (hasMedia && data.id) {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error("認証が切れました");

          for (const file of files) {
            const meta = await uploadFile(supabase, user.id, data.id, file);
            const { error: insertError } = await supabase
              .from("post_media")
              .insert({
                post_id: data.id,
                kind: meta.kind,
                storage_path: meta.storage_path,
                width: meta.width ?? null,
                height: meta.height ?? null,
                bytes: meta.bytes,
                consent_confirmed: true,
              });
            if (insertError) throw insertError;
          }
        }

        setBody("");
        setFiles([]);
        setConsentConfirmed(false);
        setCategory("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが起きました");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-wabi bg-white/60 p-4"
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="いま、どんな気持ち?"
        maxLength={500}
        rows={3}
        className="w-full resize-none rounded-xl border border-transparent bg-transparent p-2 text-base text-ink outline-none placeholder:text-ink/40 focus:border-sage/40"
        aria-label="投稿本文"
      />

      {!trialMediaBlock && (
        <div className="mt-3 border-t border-wabi/60 pt-3">
          <MediaUploader
            files={files}
            onFilesChange={setFiles}
            disabled={isPending}
          />
        </div>
      )}

      {hasMedia && (
        <div className="mt-3 space-y-2 rounded-xl bg-sage/5 p-3">
          <label className="flex items-start gap-2 text-xs text-sumi">
            <input
              type="checkbox"
              checked={consentConfirmed}
              onChange={(e) => setConsentConfirmed(e.target.checked)}
              className="mt-0.5 accent-sage"
            />
            <span>
              <strong className="text-ink">写っている人全員の同意を得ました</strong>
              <br />
              本人の同意がない投稿は削除・通報の対象になります。
            </span>
          </label>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-wabi/60 pt-3">
        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            required
            className={`rounded-full border bg-white px-3 py-1 text-xs outline-none focus:border-sage ${
              categoryMissing
                ? "border-sakura/60 text-sakura"
                : "border-wabi text-sumi"
            }`}
            aria-label="カテゴリー"
          >
            <option value="">カテゴリーを選択</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-sumi/50">{body.length} / 500</span>
          {hasContent && (
            <button
              type="button"
              onClick={reset}
              disabled={isPending}
              className="rounded-full border border-wabi bg-white px-4 py-1.5 text-sm text-sumi hover:bg-sage/5 disabled:opacity-40"
            >
              取り消す
            </button>
          )}
          <button
            type="submit"
            disabled={
              noContent ||
              consentMissing ||
              categoryMissing ||
              trialPostBlock ||
              isPending
            }
            title={
              trialPostBlock
                ? "新規アカウントは 24 時間で 5 投稿までです"
                : categoryMissing
                  ? "カテゴリーを選択してください"
                  : consentMissing
                    ? "写真・動画を投稿するには同意確認が必要です"
                    : undefined
            }
            className="rounded-full bg-sage px-5 py-1.5 text-sm font-semibold text-cream transition hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? "送信中…" : "投稿"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
