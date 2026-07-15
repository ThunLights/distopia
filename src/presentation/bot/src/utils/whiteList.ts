import { z } from "zod";

export const idTypeLabel = {
  ChannelId: "チャンネル",
  RoleId: "ロール",
  UserId: "ユーザー",
} as const;

export type WhiteListIdType = keyof typeof idTypeLabel;

export const WhiteListTargetSchema = z.object({
  idType: z.enum(["ChannelId", "RoleId", "UserId"]),
  targetId: z.string().regex(/^\d+$/),
});

export type WhiteListTarget = z.infer<typeof WhiteListTargetSchema>;

export const WhiteListEditActionSchema = z.object({
  idType: z.enum(["ChannelId", "RoleId", "UserId"]),
  targetId: z.string().regex(/^\d+$/),
  action: z.enum(["allOn", "allOff", "inviteLinkBlockOn", "inviteLinkBlockOff"]),
});

export type WhiteListEditAction = z.infer<typeof WhiteListEditActionSchema>;

export function mention(idType: WhiteListIdType, targetId: string): string {
  if (idType === "ChannelId") {
    return `<#${targetId}>`;
  }
  if (idType === "RoleId") {
    return `<@&${targetId}>`;
  }
  return `<@${targetId}>`;
}

export function encodeWhiteListTarget(idType: WhiteListIdType, targetId: string): string {
  return `${idType}:${targetId}`;
}

const SELECT_MENU_LABEL_MAX_LENGTH = 100;

export function truncateSelectMenuLabel(label: string): string {
  if (label.length <= SELECT_MENU_LABEL_MAX_LENGTH) {
    return label;
  }
  return `${label.slice(0, SELECT_MENU_LABEL_MAX_LENGTH - 1)}…`;
}

export const SELECT_MENU_MAX_OPTIONS = 25;

const EMBED_FIELD_VALUE_MAX_LENGTH = 1024;

export function buildWhiteListFieldValue(lines: string[]): string {
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

export function decodeWhiteListTargetValue(value: string): unknown {
  const [idType, targetId] = value.split(":");
  return { idType, targetId };
}

export function encodeWhiteListEditAction(
  idType: WhiteListIdType,
  targetId: string,
  action: WhiteListEditAction["action"],
): string {
  return `${idType}:${targetId}:${action}`;
}

export function decodeWhiteListEditActionValue(value: string): unknown {
  const [idType, targetId, action] = value.split(":");
  return { idType, targetId, action };
}
