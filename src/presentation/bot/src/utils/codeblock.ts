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

// Escaping turns "`" into "\`", so a backtick costs two characters of page space.
function escapedLength(char: string): number {
  return char === "`" ? 2 : char.length;
}

// Splits one line into pieces of at most `budget` escaped characters, cutting only between
// code points so neither an emoji nor a "\`" escape is ever split. In a diff block every
// continuation piece repeats the line's "+"/"-"/" " marker, keeping its color across the cut.
function splitLine(line: string, budget: number, isDiff: boolean): string[] {
  const chars = Array.from(line);
  const marker = isDiff && ["+", "-", " "].includes(chars[0] ?? "") ? (chars[0] ?? "") : "";
  const pieces: string[] = [];
  let current = "";
  let currentLength = 0;
  for (const char of chars) {
    if (currentLength + escapedLength(char) > budget) {
      pieces.push(current);
      current = marker;
      currentLength = marker.length;
    }
    current += char;
    currentLength += escapedLength(char);
  }
  pieces.push(current);
  return pieces;
}

/**
 * Wraps content in as many code-fenced pages as it needs, each within maxLength (e.g. an
 * embed field's 1024-char limit), so nothing is ever cut off. Pages break between lines;
 * a single line longer than a page is split across pages.
 */
export function codeBlockChunks(
  content: string,
  lang = "",
  maxLength = DEFAULT_MAX_LENGTH,
): [string, ...string[]] {
  const fenceOpen = `\`\`\`${lang}\n`;
  const fenceClose = "```\n";
  const budget = maxLength - fenceOpen.length - fenceClose.length;
  // Room for at least a marker plus one (possibly escaped) character per piece.
  if (budget < 3) {
    throw new RangeError("maxLength cannot hold the fenced content");
  }

  const pieces = content
    .split("\n")
    .flatMap((line) => splitLine(line, budget, lang === "diff"))
    .map((piece) => piece.replaceAll("`", "\\`"));

  const pages: string[] = [];
  let page: string[] = [];
  let pageLength = 0;
  for (const piece of pieces) {
    const added = page.length === 0 ? piece.length : piece.length + 1;
    if (page.length > 0 && pageLength + added > budget) {
      pages.push(page.join("\n"));
      page = [];
      pageLength = 0;
    }
    pageLength += page.length === 0 ? piece.length : piece.length + 1;
    page.push(piece);
  }
  pages.push(page.join("\n"));

  const [first, ...rest] = pages.map((text) => fenceOpen + text + fenceClose);
  return [first ?? fenceOpen + fenceClose, ...rest];
}
