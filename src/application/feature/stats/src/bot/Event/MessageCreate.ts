import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

export class MessageCreateEvent extends FeatureEventBase<"messageCreate"> {
  public override readonly event = "messageCreate";

  public override async handle(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.guildId && message.member?.id) {
      await this.core.message.increase(
        message.guildId,
        message.member.id,
        message.content,
        message.author.bot,
      );
    }
  }
}
