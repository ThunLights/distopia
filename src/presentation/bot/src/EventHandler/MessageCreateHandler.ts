import { formatYMD } from "app-core/date";
import type { Message, OmitPartialGroupDMChannel } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class MessageCreateHandler extends BaseHandler<
  (message: OmitPartialGroupDMChannel<Message<boolean>>) => void
> {
  public override async handle(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    const { messageCreate } = this.core.state.memory.latelimit;
    const limit = message.member?.id && messageCreate.get(message.member.id);

    if (message.guildId && limit && Date.now() > limit.getTime()) {
      messageCreate.delete(message.member.id);
      await this.core.guild.increaseNewMessage(message.guildId, await formatYMD(new Date()));
    }
  }
}
