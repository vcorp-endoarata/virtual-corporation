import Link from "next/link";

const LABEL: Record<string, string> = {
  self: "当事者の場",
  family: "身近な人の場",
  shared: "みんなの場",
};

const ICON: Record<string, string> = {
  self: "🌱",
  family: "🤲",
  shared: "🌅",
};

export function SpaceSwitcher({
  current,
  accessible,
}: {
  current: string;
  accessible: string[];
}) {
  return (
    <nav
      aria-label="スペース切替"
      className="flex gap-2 rounded-2xl border border-wabi bg-white/40 p-1"
    >
      {accessible.map((s) => {
        const active = current === s;
        return (
          <Link
            key={s}
            href={`/feed?space=${s}`}
            className={`flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm transition ${
              active
                ? "bg-sage text-cream"
                : "text-sumi hover:bg-sage/10"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden>{ICON[s]}</span>
            <span>{LABEL[s]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
