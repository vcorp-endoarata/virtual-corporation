"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MediaUploader } from "@/components/MediaUploader";
import { uploadFile } from "@/lib/storage";

export function ReplyComposer({ postId }: { postId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remaining = 500 - body.length;
  const hasMedia = files.length > 0;
  const consentMissing = hasMedia && !consentConfirmed;
  const noContent = body.trim().length === 0 && !hasMedia;
  const disabled = noContent || consentMissing || isPending;
  const hasContent = body.length > 0 || hasMedia;

  function reset() {
    if (hasContent && !confirm("入力中の返信を取り消しますか?")) return;
    setBody("");
    setFiles([]);
    setConsentConfirmed(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim() || "(写真・動画の返信)",
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? "返信を投稿できませんでした");
        return;
      }

      const data = (await res.json()) as { reply: { id: string } };
      const replyId = data.reply.id;

      if (hasMedia && replyId) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("認証が切れました");

        for (const file of files) {
          const meta = await uploadFile(supabase, user.id, replyId, file);
          const { error: insertError } = await supabase
            .from("post_media")
            .insert({
              reply_id: replyId,
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
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "返信に失敗しました");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="reply-body" className="sr-only">
        返信を書く
      </label>
      <textarea
        id="reply-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="返事を書く"
        rows={3}
        maxLength={500}
        className="w-full rounded-2xl border border-wabi bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-sumi/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
      />

      <div className="border-t border-wabi/60 pt-2">
        <MediaUploader
          files={files}
          onFilesChange={setFiles}
          disabled={isPending}
        />
      </div>

      {hasMedia && (
        <label className="flex items-start gap-2 rounded-xl bg-sage/5 p-3 text-xs text-sumi">
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
      )}

      <div className="flex items-center justify-between gap-3">
        <span
          className={`text-xs ${
            remaining < 0
              ? "text-sakura"
              : remaining < 50
                ? "text-sumi"
                : "text-sumi/60"
          }`}
        >
          残り {remaining} 字
        </span>
        <div className="flex items-center gap-2">
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
            disabled={disabled}
            title={consentMissing ? "写真・動画を投稿するには同意確認が必要です" : undefined}
            className="rounded-full bg-sage px-5 py-1.5 text-sm font-semibold text-cream disabled:bg-sage/30"
          >
            {isPending ? "送信中…" : "返信する"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-sakura">
          {error}
        </p>
      )}
    </form>
  );
}
