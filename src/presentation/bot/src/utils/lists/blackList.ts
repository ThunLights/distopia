import { BLACK_LIST_LIMIT, NUM_BLACK_LIST_TAG_LIMIT } from "app-core/constant";
import { z } from "zod";

import { buildTruncatedFieldValue, truncateSelectMenuLabel } from "./selectMenuFormat";

export { truncateSelectMenuLabel };

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
  tag: z.string().min(1).max(BLACK_LIST_LIMIT.tag),
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
  .array(z.string().min(1).max(BLACK_LIST_LIMIT.tag))
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

export function buildBlackListFieldValue(lines: string[]): string {
  return buildTruncatedFieldValue(lines);
}
