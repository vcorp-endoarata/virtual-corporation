"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/Avatar";

const MAX_AVATAR_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUploader({
  userId,
  nickname,
  initialUrl,
}: {
  userId: string;
  nickname: string;
  initialUrl: string | null;
}) {
  const router = useRouter();
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function flashMsg(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1800);
  }

  function pickFile() {
    inputRef.current?.click();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      setError("画像形式は JPEG / PNG / WebP のみです");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("4MB 以下の画像を選んでください");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const ext =
          file.type === "image/png"
            ? "png"
            : file.type === "image/webp"
              ? "webp"
              : "jpg";
        // Cache-bust by using new uuid for each upload (browsers cache by URL)
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(path, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });
        if (uploadErr) throw uploadErr;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${path}`;

        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ avatar_url: publicUrl }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "保存できませんでした");
        }

        setUrl(publicUrl);
        flashMsg("✓ 保存しました");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "アップロード失敗");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ avatar_url: null }),
        });
        if (!res.ok) throw new Error("削除に失敗しました");
        setUrl(null);
        flashMsg("削除しました");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "削除に失敗しました");
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar url={url} nickname={nickname} size="xl" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={pickFile}
            disabled={isPending}
            className="rounded-full bg-sage px-4 py-1.5 text-sm font-semibold text-cream hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "保存中…" : url ? "画像を変更" : "画像を選ぶ"}
          </button>
          {url && (
            <button
              type="button"
              onClick={remove}
              disabled={isPending}
              className="rounded-full border border-wabi px-4 py-1.5 text-sm text-sumi hover:bg-sage/5 disabled:opacity-50"
            >
              削除
            </button>
          )}
        </div>
        <p className="text-xs text-sumi/70">
          JPEG / PNG / WebP・4MB まで。
          <br />
          設定しない場合、ニックネームの頭文字が表示されます。
        </p>
        {flash && (
          <span className="text-xs text-sage" role="status">
            {flash}
          </span>
        )}
        {error && (
          <span className="text-xs text-red-600" role="alert">
            {error}
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          className="hidden"
          onChange={onChange}
        />
      </div>
    </div>
  );
}
