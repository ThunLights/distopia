import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { sendLog } from "../sendLog";

export class MessageDeleteEvent extends FeatureEventBase<"messageDelete"> {
  public override readonly event = "messageDelete";

  public override async handle(message: OmitPartialGroupDMChannel<Message | PartialMessage>) {
    if (!message.guild || message.partial || message.author.bot) {
      return;
    }

    const content = message.content || "(空)";
    await sendLog(this.core, message.guild, "logMessageDelete", message, content);
  }
}
