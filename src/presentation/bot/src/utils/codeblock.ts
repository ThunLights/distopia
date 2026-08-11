// Discord embed field values are capped at 1024 characters.
const DEFAULT_MAX_LENGTH = 1024;
const TRUNCATION_MARKER = "…";

export async function codeBlock(content: string, lang?: string, maxLength = DEFAULT_MAX_LENGTH) {
  const codeBlockLang = lang ?? "";
  const escaped = content.replaceAll("`", "\\`");
  const fenceOpen = `\`\`\`${codeBlockLang}\n`;
  const fenceClose = "```\n";

  if (fenceOpen.length + escaped.length + fenceClose.length <= maxLength) {
    return fenceOpen + escaped + fenceClose;
  }

  const available = Math.max(
    0,
    maxLength - fenceOpen.length - fenceClose.length - TRUNCATION_MARKER.length,
  );

  return fenceOpen + escaped.slice(0, available) + TRUNCATION_MARKER + fenceClose;
}
