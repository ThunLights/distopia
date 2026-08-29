import type { AppCore } from "app-core";
import type { Message, OmitPartialGroupDMChannel } from "discord.js";

import type { Logger } from "../logging/Logger";

export async function detectSpamMessage(
  core: AppCore,
  logger: Logger,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
): Promise<boolean> {
  const content = message.content;

  if (!message.guildId) {
    return false;
  }

  const settings = await core.guild.getSetting(message.guildId);

  if (settings?.inviteLinkBlock && !message.member?.permissions.has("Administrator")) {
    const targetIds = [
      message.author.id,
      message.channelId,
      ...(message.member?.roles.cache.map((role) => role.id) ?? []),
    ];

    if (await core.guild.isWhiteListed(message.guildId, targetIds, "InviteLinkBlock")) {
      return false;
    }

    const inviteLinks = await core.message.includeInviteLink(content);
    if (inviteLinks.length) {
      if (message.deletable) {
        await message.delete();
      }
      if (message.guild) {
        await logger.log(message.guild, "logAntiRaid", message, inviteLinks);
      }
      return true;
    }

    const embedInviteLinks = await core.state.discord.embed.detectInviteLinks(message.embeds);
    if (embedInviteLinks.length) {
      const messages = message.channel.messages.cache
        .values()
        .toArray()
        .filter((msg) => msg.author.id === message.author.id);

      for (const msg of messages) {
        for (const inviteLink of embedInviteLinks) {
          if (msg.content.includes(inviteLink) && msg.deletable) {
            await msg.delete();
          }
        }
      }

      if (message.deletable) {
        await message.delete();
      }

      if (message.guild) {
        await logger.log(message.guild, "logAntiRaid", message, embedInviteLinks);
      }

      return true;
    }
  }

  return false;
}
