// Shared by blackList.ts and whiteList.ts, which previously each carried an identical
// copy of both functions below.
const SELECT_MENU_LABEL_MAX_LENGTH = 100;

export function truncateSelectMenuLabel(label: string): string {
  if (label.length <= SELECT_MENU_LABEL_MAX_LENGTH) {
    return label;
  }
  return `${label.slice(0, SELECT_MENU_LABEL_MAX_LENGTH - 1)}…`;
}

const EMBED_FIELD_VALUE_MAX_LENGTH = 1024;

export function buildTruncatedFieldValue(lines: string[]): string {
  if (!lines.length) {
    return "登録されていません";
  }

  const shown: string[] = [];
  let length = 0;

  for (const line of lines) {
    const addedLength = shown.length ? line.length + 1 : line.length;
    if (length + addedLength > EMBED_FIELD_VALUE_MAX_LENGTH) {
      break;
    }
    shown.push(line);
    length += addedLength;
  }

  if (shown.length === lines.length) {
    return shown.join("\n");
  }

  let omitted = lines.length - shown.length;
  let suffix = `\n…ほか${omitted}件`;
  while (shown.length && length + suffix.length > EMBED_FIELD_VALUE_MAX_LENGTH) {
    const removed = shown.pop();
    length -= shown.length ? (removed?.length ?? 0) + 1 : (removed?.length ?? 0);
    omitted++;
    suffix = `\n…ほか${omitted}件`;
  }

  return `${shown.join("\n")}${suffix}`;
}
