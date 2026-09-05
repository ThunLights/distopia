// Discord caps a message's plain content at 2000 characters (interaction replies included).
export const MESSAGE_CONTENT_LIMIT = 2000;

// Joins lines with newlines, stopping before the result would exceed maxLength, and appends
// an omission note naming how many lines were left out. Used for list-style replies
// (dictionary/ignore-list entries) whose item count isn't bounded by anything else, so a
// large server could otherwise produce a reply Discord rejects outright.
export function joinLinesWithinLimit(lines: string[], maxLength: number = MESSAGE_CONTENT_LIMIT): string {
  let result = "";
  let included = 0;

  for (const line of lines) {
    const next = result === "" ? line : `${result}\n${line}`;
    if (next.length > maxLength) {
      break;
    }
    result = next;
    included++;
  }

  const omitted = lines.length - included;
  if (omitted === 0) {
    return result;
  }

  // Slice by character count (not by dropping whole lines) to guarantee the note always
  // fits -- even a single line already at/near maxLength must not push the total over.
  const note = `\n…他${omitted}件`;
  const available = Math.max(0, maxLength - note.length);
  return result.slice(0, available) + note;
}
