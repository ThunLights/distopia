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
  }
}
