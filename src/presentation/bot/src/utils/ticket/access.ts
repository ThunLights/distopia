import type { AppCore } from "app-core";
import { OverwriteType, type Collection, type Guild, type PermissionsString } from "discord.js";

export const TICKET_ACCESS: PermissionsString[] = [
  "ViewChannel",
  "SendMessages",
  "ReadMessageHistory",
  "AttachFiles",
  "EmbedLinks",
];

// Drops every member overwrite except the bot's; @everyone's deny and the support role stay.
export function staffOverwrites<T extends { id: string; type: OverwriteType }>(
  overwrites: Collection<string, T>,
  botId: string,
): Collection<string, T> {
  return overwrites.filter(({ id, type }) => type === OverwriteType.Role || id === botId);
}

// The opener and added members can see the channel too, so visibility alone is not enough.
export async function isTicketStaff(
  core: Pick<AppCore, "guild">,
  guild: Pick<Guild, "id" | "members">,
  userId: string,
): Promise<boolean> {
  const member = await guild.members.fetch(userId);
  if (member.permissions.has("Administrator")) {
    return true;
  }

  const settings = await core.guild.getSetting(guild.id);
  return !!settings?.ticketRole && member.roles.cache.has(settings.ticketRole);
}
