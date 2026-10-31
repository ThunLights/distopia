import type { TicketActor } from "app-core/Ticket";
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

export async function ticketActor(
  guild: Pick<Guild, "members">,
  userId: string,
): Promise<TicketActor> {
  const member = await guild.members.fetch(userId);
  return {
    userId,
    isAdministrator: member.permissions.has("Administrator"),
    roleIds: [...member.roles.cache.keys()],
  };
}
