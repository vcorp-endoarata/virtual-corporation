import Link from "next/link";

const CATEGORIES = [
  { value: "", label: "すべて", icon: "✦" },
  { value: "feeling", label: "気持ち", icon: "🌥" },
  { value: "worry", label: "悩み", icon: "💭" },
  { value: "experience", label: "体験", icon: "✨" },
  { value: "question", label: "質問", icon: "❓" },
  { value: "celebration", label: "お祝い", icon: "🌱" },
  { value: "diary", label: "日記", icon: "📝" },
] as const;

export function CategoryFilter({
  current,
  space,
}: {
  current?: string;
  space: string;
}) {
  return (
    <nav
      aria-label="カテゴリーフィルタ"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1"
    >
      {CATEGORIES.map((c) => {
        const active = (current ?? "") === c.value;
        const href = c.value
          ? `/feed?space=${space}&category=${c.value}`
          : `/feed?space=${space}`;
        return (
          <Link
            key={c.value || "all"}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
              active
                ? "border-sage bg-sage text-cream"
                : "border-wabi bg-white/60 text-sumi hover:border-sage hover:text-sage"
            }`}
          >
            <span aria-hidden>{c.icon}</span>
            <span>{c.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
