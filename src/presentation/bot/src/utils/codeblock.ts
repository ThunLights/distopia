const DEFAULT_MAX_LENGTH = 1024;
const TRUNCATION_MARKER = "…";

export async function codeBlock(content: string, lang?: string, maxLength = DEFAULT_MAX_LENGTH) {
  return codeBlockPages(content, lang, maxLength)[0];
}

/**
 * Wraps content in one or two code-fenced pages, each within maxLength (e.g. an embed
 * field's 1024-char limit). A second page is returned only when the first can't fit
 * everything, so callers can send the remainder as a follow-up message instead of
 * silently truncating it.
 */
export function codeBlockPages(
  content: string,
  lang?: string,
  maxLength = DEFAULT_MAX_LENGTH,
): [string] | [string, string] {
  const codeBlockLang = lang ?? "";
  const escaped = content.replaceAll("`", "\\`");
  const fenceOpen = `\`\`\`${codeBlockLang}\n`;
  const fenceClose = "```\n";
  const overhead = fenceOpen.length + fenceClose.length;

  if (overhead + escaped.length <= maxLength) {
    return [fenceOpen + escaped + fenceClose];
  }

  const pageSize = Math.max(0, maxLength - overhead);
  const firstPage = escaped.slice(0, pageSize);
  const rest = escaped.slice(pageSize);

  if (overhead + rest.length <= maxLength) {
    return [fenceOpen + firstPage + fenceClose, fenceOpen + rest + fenceClose];
  }

  // ponytail: content beyond 2 pages is truncated rather than paginated further;
  // upgrade to N-page pagination if logs regularly exceed ~2000 chars.
  const secondPage = rest.slice(0, Math.max(0, pageSize - TRUNCATION_MARKER.length));
  return [
    fenceOpen + firstPage + fenceClose,
    fenceOpen + secondPage + TRUNCATION_MARKER + fenceClose,
  ];
}
