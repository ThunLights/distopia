import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { EventPriority, FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";
import { SkipOtherProcess } from "presentation-bot-kit/feature";

import { detectSpamMessage } from "../spamDetector";

export class MessageCreateEvent extends FeatureEventBase<"messageCreate"> {
  public override readonly event = "messageCreate";
  public override readonly priority = EventPriority.Moderation;

  public override async handle(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (await detectSpamMessage(this.core, message)) {
      return new SkipOtherProcess();
    }
  }
}
