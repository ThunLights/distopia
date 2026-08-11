import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class MessageDeleteHandler extends BaseHandler<
  (message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>) => void
> {
  public override async handle(
    message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
  ): Promise<void> {
    if (!message.guild || message.partial || message.author.bot) {
      return;
    }

    const content = message.content || "(空)";

    await this.logger.log(message.guild, "logMessageDelete", message, content);
  }
}
