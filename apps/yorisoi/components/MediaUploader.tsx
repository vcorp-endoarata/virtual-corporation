"use client";

import { useRef } from "react";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_FILES_PER_POST,
  classifyFile,
  validateFile,
} from "@/lib/storage";

const ACCEPT = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(",");

export function MediaUploader({
  files,
  onFilesChange,
  disabled = false,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const arr = Array.from(incoming);
    const errors: string[] = [];
    const valid: File[] = [];
    for (const f of arr) {
      const err = validateFile(f);
      if (err) errors.push(err);
      else valid.push(f);
    }
    const merged = [...files, ...valid].slice(0, MAX_FILES_PER_POST);
    onFilesChange(merged);
    if (errors.length > 0) {
      alert(errors.join("\n"));
    }
    if (arr.length + files.length > MAX_FILES_PER_POST) {
      alert(`一度に投稿できるのは ${MAX_FILES_PER_POST} つまでです`);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(idx: number) {
    onFilesChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || files.length >= MAX_FILES_PER_POST}
          className="rounded-full border border-wabi bg-white px-3 py-1 text-xs text-sumi hover:bg-sage/5 disabled:opacity-40"
          aria-label="写真または動画を追加"
        >
          📷 写真・動画を追加
        </button>
        <span className="text-xs text-sumi/60">
          {files.length} / {MAX_FILES_PER_POST}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {files.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {files.map((f, i) => {
            const kind = classifyFile(f);
            const url = URL.createObjectURL(f);
            return (
              <li
                key={`${f.name}-${i}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-wabi bg-cream"
              >
                {kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={f.name}
                    className="h-full w-full object-cover"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                ) : (
                  <video
                    src={url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`${f.name} を削除`}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-cream hover:bg-black/80"
                >
                  ×
                </button>
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-cream">
                  {kind === "video" ? "動画" : "画像"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
