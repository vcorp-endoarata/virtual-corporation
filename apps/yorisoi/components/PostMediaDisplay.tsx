"use client";

import { getPublicUrl } from "@/lib/storage";

type Media = {
  id: string;
  kind: "image" | "video";
  storage_path: string;
  width?: number | null;
  height?: number | null;
};

export function PostMediaDisplay({ media }: { media: Media[] }) {
  if (!media || media.length === 0) return null;

  const isSingle = media.length === 1;
  const gridClass = isSingle
    ? "grid grid-cols-1"
    : media.length === 2
      ? "grid grid-cols-2 gap-1"
      : "grid grid-cols-2 gap-1";

  return (
    <div className={`mt-3 overflow-hidden rounded-xl ${gridClass}`}>
      {media.map((m) => (
        <MediaItem key={m.id} m={m} cover={!isSingle} />
      ))}
    </div>
  );
}

function MediaItem({ m, cover }: { m: Media; cover: boolean }) {
  const url = getPublicUrl(m.storage_path);

  const aspectClass = cover ? "aspect-square" : "max-h-[600px]";
  const imgClass = cover
    ? "h-full w-full object-cover"
    : "h-auto max-h-[600px] w-full object-contain";

  return (
    <figure className={`relative overflow-hidden bg-cream ${aspectClass}`}>
      {m.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          loading="lazy"
          className={imgClass}
          width={m.width ?? undefined}
          height={m.height ?? undefined}
        />
      ) : (
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          className={imgClass}
        />
      )}
    </figure>
  );
}
