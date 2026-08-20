import { z } from "zod";

export type BlackListAction = "Log" | "Kick" | "Ban";

export const blackListActionLabels: Record<BlackListAction, string> = {
  Log: "ログのみ",
  Kick: "キック",
  Ban: "BAN",
};

export type BlackListPermission = "AddTarget" | "EditTarget" | "RemoveTarget";

export const BlackListTargetRefSchema = z.object({
  blackListId: z.coerce.number().int(),
  userId: z.string().regex(/^\d+$/),
});

export type BlackListTargetRef = z.infer<typeof BlackListTargetRefSchema>;

export function encodeBlackListTargetRef(blackListId: number, userId: string): string {
  return `${blackListId}:${userId}`;
}

export function decodeBlackListTargetRef(value: string): unknown {
  const [blackListId, userId] = value.split(":");
  return { blackListId, userId };
}

const SELECT_MENU_LABEL_MAX_LENGTH = 100;

export function truncateSelectMenuLabel(label: string): string {
  if (label.length <= SELECT_MENU_LABEL_MAX_LENGTH) {
    return label;
  }
  return `${label.slice(0, SELECT_MENU_LABEL_MAX_LENGTH - 1)}…`;
}

const EMBED_FIELD_VALUE_MAX_LENGTH = 1024;

export function buildBlackListFieldValue(lines: string[]): string {
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
