import type { Message, OmitPartialGroupDMChannel } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class MessageCreateHandler extends BaseHandler<
  (message: OmitPartialGroupDMChannel<Message<boolean>>) => void
> {
  public override async handle(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    const content = message.content;
    const settings = message.guildId ? await this.core.guild.getSetting(message.guildId) : null;

    if (settings?.inviteLinkBlock && !message.member?.permissions.has("Administrator")) {
      const inviteLinks = await this.core.message.includeInviteLink(content);
      if (inviteLinks.length) {
        if (message.deletable) {
          await message.delete();
        }
        return;
      }

      const embedInviteLinks = await this.core.state.discord.embed.detectInviteLinks(
        message.embeds,
      );
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

        return;
      }
    }

    if (message.guildId && message.member?.id) {
      await this.core.message.increase(message.guildId, message.member.id, content);
    }
  }
}
