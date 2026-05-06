export type Role = "self" | "family" | "supporter";
export type PostSpace = "self" | "family" | "shared";
export type PostCategory =
  | "feeling"
  | "worry"
  | "experience"
  | "question"
  | "celebration"
  | "diary";

export const ROLE_LABELS: Record<Role, string> = {
  self: "当事者",
  family: "家族・身近な人",
  supporter: "支援者",
};

export const SPACE_LABELS: Record<PostSpace, string> = {
  self: "当事者の場",
  family: "家族・支援者の場",
  shared: "みんなの場",
};

export const SPACE_DESCRIPTIONS: Record<PostSpace, string> = {
  self: "発達障害の当事者だけが、安心して話せる場所",
  family: "家族や支援者が、本音で交流できる場所",
  shared: "立場を越えて、みんなが寄り添う場所",
};

export const CATEGORIES: {
  value: PostCategory;
  label: string;
  emoji: string;
  desc: string;
}[] = [
  { value: "feeling", label: "気持ち", emoji: "🌥", desc: "今この瞬間の感情" },
  { value: "worry", label: "悩み", emoji: "💭", desc: "相談したいこと" },
  { value: "experience", label: "体験", emoji: "✨", desc: "実体験のシェア" },
  { value: "question", label: "質問", emoji: "❓", desc: "聞きたいこと" },
  { value: "celebration", label: "お祝い", emoji: "🌱", desc: "小さな勝ち" },
  { value: "diary", label: "日記", emoji: "📝", desc: "なんでもない記録" },
];

export const CATEGORY_BY_VALUE = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c]),
) as Record<PostCategory, (typeof CATEGORIES)[number]>;

/**
 * role に応じてアクセスできるスペース。
 */
export function spacesForRole(role: Role): PostSpace[] {
  if (role === "self") return ["self", "shared"];
  return ["family", "shared"];
}
