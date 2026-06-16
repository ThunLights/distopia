import type { Message, OmitPartialGroupDMChannel } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class MessageCreateHandler extends BaseHandler<
  (message: OmitPartialGroupDMChannel<Message<boolean>>) => void
> {
  public override async handle(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    if (message.guildId && message.member?.id) {
      await this.core.message.increase(message.guildId, message.member.id, message.content);
    }

    const inviteLinks = await this.core.message.includeInviteLink(message.content);
    if (inviteLinks.length) {
      if (message.deletable) {
        await message.delete();
      }
      return;
    }

    const embedInviteLinks = await this.core.state.discord.embed.detectInviteLinks(message.embeds);
    if (embedInviteLinks.length) {
      const messages = (await message.channel.messages.fetch({ limit: 30 })).values().toArray();

      for (const msg of messages) {
        if (msg.deletable) {
          await msg.delete();
        }
      }

      if (message.deletable) {
        await message.delete();
      }

      return;
    }
  }
}
