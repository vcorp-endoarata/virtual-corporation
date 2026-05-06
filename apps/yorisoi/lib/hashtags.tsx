import Link from "next/link";

const HASHTAG_RE = /#([^\s#.,!?()\[\]{}「」、。 　…]{1,50})/g;

/**
 * 本文中の #タグ を /tag/[name] へのリンクに変換する。
 * 改行はそのまま反映 (whitespace-pre-wrap で表示)。
 */
export function renderBodyWithTags(body: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  HASHTAG_RE.lastIndex = 0;
  while ((match = HASHTAG_RE.exec(body)) !== null) {
    if (match.index > lastIndex) {
      parts.push(body.slice(lastIndex, match.index));
    }
    const tag = match[1].toLowerCase();
    parts.push(
      <Link
        key={`tag-${key++}-${match.index}`}
        href={`/tag/${encodeURIComponent(tag)}`}
        className="text-sage hover:underline"
      >
        #{match[1]}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < body.length) {
    parts.push(body.slice(lastIndex));
  }
  return parts;
}
