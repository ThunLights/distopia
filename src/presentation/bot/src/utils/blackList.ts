import { CHARACTER_LIMIT, NUM_BLACK_LIST_TAG_LIMIT } from "app-core/constant";
import { z } from "zod";

export type BlackListPermission = "AddTarget" | "EditTarget" | "RemoveTarget";

export const blackListPermissionLabels: Record<BlackListPermission, string> = {
  AddTarget: "追加",
  EditTarget: "編集",
  RemoveTarget: "削除",
};

export function blackListEditorPermissionSummary(editor: {
  allPermissions: boolean;
  permissions: BlackListPermission[];
}): string {
  if (editor.allPermissions) {
    return "全許可";
  }
  if (!editor.permissions.length) {
    return "権限なし";
  }
  return editor.permissions.map((permission) => blackListPermissionLabels[permission]).join(", ");
}

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

export const BlackListTagRefSchema = z.object({
  blackListId: z.coerce.number().int(),
  tag: z.string().min(1).max(CHARACTER_LIMIT.tag),
});

export function encodeBlackListTagRef(blackListId: number, tag: string): string {
  return `${blackListId}:${tag}`;
}

export function decodeBlackListTagRef(value: string): unknown {
  const separatorIndex = value.indexOf(":");
  if (separatorIndex === -1) {
    return { blackListId: value, tag: "" };
  }
  return {
    blackListId: value.slice(0, separatorIndex),
    tag: value.slice(separatorIndex + 1),
  };
}

export const BlackListTagsSchema = z
  .array(z.string().min(1).max(CHARACTER_LIMIT.tag))
  .max(NUM_BLACK_LIST_TAG_LIMIT);

export function parseBlackListTagsInput(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,\n]/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    ),
  );
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
