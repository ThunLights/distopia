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
