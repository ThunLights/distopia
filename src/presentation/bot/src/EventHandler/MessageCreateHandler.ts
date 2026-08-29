import type { Message, OmitPartialGroupDMChannel } from "discord.js";

import { detectSpamMessage } from "../utils/moderation/spamDetector";
import { BaseHandler } from "./BaseHandler";

export class MessageCreateHandler extends BaseHandler<
  (message: OmitPartialGroupDMChannel<Message<boolean>>) => void
> {
  public override async handle(
    message: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    const isDetected = await detectSpamMessage(this.core, this.logger, message);

    if (isDetected) {
      return;
    }

    if (message.guildId && message.member?.id) {
      await this.core.message.increase(message.guildId, message.member.id, message.content);
    }
  }
}
