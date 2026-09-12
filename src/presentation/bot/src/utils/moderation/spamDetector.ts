import type { AppCore } from "app-core";
import {
  DiscordAPIError,
  RESTJSONErrorCodes,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";

import type { Logger } from "../logging/Logger";

// `deletable` only reflects cached permissions at read time -- another mod/bot could have
// already deleted this message by the time the API call lands, which throws "Unknown
// Message". That specific failure is expected and fine to ignore; any other rejection
// (e.g. missing permissions) means the message is still there, so it must not be swallowed
// silently -- callers report successful moderation based on this resolving.
async function deleteIgnoringUnknownMessage(target: { delete(): Promise<unknown> }): Promise<void> {
  try {
    await target.delete();
  } catch (error) {
    if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
      return;
    }
    console.error("[anti-raid] failed to delete spam message", error);
  }
}

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
        await deleteIgnoringUnknownMessage(message);
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
            await deleteIgnoringUnknownMessage(msg);
          }
        }
      }

      if (message.deletable) {
        await deleteIgnoringUnknownMessage(message);
      }

      if (message.guild) {
        await logger.log(message.guild, "logAntiRaid", message, embedInviteLinks);
      }

      return true;
    }
  }

  return false;
}
