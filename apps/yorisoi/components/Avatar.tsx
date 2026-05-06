import Link from "next/link";

const COLOR_PALETTE = [
  "from-sage to-sora",
  "from-sakura to-beige",
  "from-sora to-sage",
  "from-beige to-sakura",
  "from-sage to-beige",
];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return COLOR_PALETTE[h % COLOR_PALETTE.length];
}

function initial(name: string): string {
  if (!name) return "?";
  const ch = Array.from(name)[0];
  return ch.toUpperCase();
}

const SIZE_CLASSES: Record<string, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
};

export type AvatarSize = keyof typeof SIZE_CLASSES;

export function Avatar({
  url,
  nickname,
  size = "md",
  href,
  ringClass,
}: {
  url?: string | null;
  nickname: string;
  size?: AvatarSize;
  /** Wrap in a Link to this href */
  href?: string;
  /** Extra ring class for emphasis (e.g. "ring-2 ring-sage") */
  ringClass?: string;
}) {
  const sizeClass = SIZE_CLASSES[size];
  const inner = url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      loading="lazy"
      className={`${sizeClass} rounded-full object-cover ${ringClass ?? ""}`}
    />
  ) : (
    <span
      aria-hidden
      className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br ${colorFor(nickname)} font-semibold text-cream ${ringClass ?? ""}`}
    >
      {initial(nickname)}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`${nickname} のプロフィール`}>
        {inner}
      </Link>
    );
  }
  return inner;
}
