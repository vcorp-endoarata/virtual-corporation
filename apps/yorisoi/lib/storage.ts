import type { SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "post-media";

export const MAX_FILES_PER_POST = 4;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

export type MediaKind = "image" | "video";

export function classifyFile(file: File): MediaKind | null {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return "image";
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) return "video";
  return null;
}

export function validateFile(file: File): string | null {
  const kind = classifyFile(file);
  if (!kind) {
    return `${file.name}: 対応していないファイル形式です (jpeg/png/webp/gif/mp4/mov/webm)`;
  }
  const limit = kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    const limitMB = Math.floor(limit / 1024 / 1024);
    return `${file.name}: ファイルサイズが大きすぎます (上限 ${limitMB}MB)`;
  }
  return null;
}

export function getPublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${url}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
}

export type UploadedMedia = {
  storage_path: string;
  kind: MediaKind;
  bytes: number;
  width?: number;
  height?: number;
  duration_ms?: number;
};

/**
 * ブラウザでファイルを Supabase Storage にアップロード。
 * パス: {user_id}/{post_id}/{uuid}.{ext}
 */
export async function uploadFile(
  supabase: SupabaseClient,
  userId: string,
  postId: string,
  file: File,
): Promise<UploadedMedia> {
  const kind = classifyFile(file);
  if (!kind) throw new Error("Unsupported file type");

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
  const uuid = crypto.randomUUID();
  const storagePath = `${userId}/${postId}/${uuid}.${ext}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw error;

  const meta: UploadedMedia = {
    storage_path: storagePath,
    kind,
    bytes: file.size,
  };

  // 画像の場合: 寸法を取得 (任意)
  if (kind === "image") {
    try {
      const dims = await readImageDimensions(file);
      meta.width = dims.width;
      meta.height = dims.height;
    } catch {
      /* ignore */
    }
  }

  return meta;
}

function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image dimensions"));
    };
    img.src = url;
  });
}
