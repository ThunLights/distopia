import { structuredPatch } from "diff";

const CONTEXT_LINES = 2;
const OMITTED = " …";

// jsdiff treats a final line without "\n" as different from the same line with one, so an
// append ("a" -> "a\nb") would otherwise show "a" as removed and re-added.
function withTrailingNewline(content: string): string {
  return content === "" || content.endsWith("\n") ? content : `${content}\n`;
}

/**
 * Line-level diff in unified style (`-` removed, `+` added, ` ` unchanged), keeping
 * CONTEXT_LINES of context around each change and marking skipped unchanged lines with "…",
 * so a one-line edit to a long text still shows the change itself when the output gets
 * truncated. Returns null when no line changed.
 */
export function lineDiff(oldContent: string, newContent: string): string | null {
  const oldText = withTrailingNewline(oldContent);
  const { hunks } = structuredPatch(
    "",
    "",
    oldText,
    withTrailingNewline(newContent),
    undefined,
    undefined,
    { context: CONTEXT_LINES },
  );
  if (hunks.length === 0) {
    return null;
  }

  const oldLineCount = oldText === "" ? 0 : oldText.split("\n").length - 1;
  const output: string[] = [];
  for (const hunk of hunks) {
    // jsdiff merges hunks whose context overlaps, so any hunk after the first has a gap.
    if (hunk.oldStart > 1 || output.length > 0) {
      output.push(OMITTED);
    }
    output.push(...hunk.lines);
  }

  const last = hunks.at(-1);
  if (last && oldLineCount > 0 && last.oldStart + last.oldLines - 1 < oldLineCount) {
    output.push(OMITTED);
  }
  return output.join("\n");
}
