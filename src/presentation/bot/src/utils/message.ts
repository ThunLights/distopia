import type { AppCore } from "app-core";
import type { Message, OmitPartialGroupDMChannel } from "discord.js";

export async function detectSpamMessage(
  core: AppCore,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
): Promise<boolean> {
  const content = message.content;
  const settings = message.guildId ? await core.guild.getSetting(message.guildId) : null;

  if (settings?.inviteLinkBlock && !message.member?.permissions.has("Administrator")) {
    const inviteLinks = await core.message.includeInviteLink(content);
    if (inviteLinks.length) {
      if (message.deletable) {
        await message.delete();
      }
      return true;
    }

    const embedInviteLinks = await core.state.discord.embed.detectInviteLinks(message.embeds);
    if (embedInviteLinks.length) {
      const messages = (await message.channel.messages.fetch({ limit: 30 })).values().toArray();

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

      return true;
    }
  }

  return false;
}
