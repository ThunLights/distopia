import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";
import { EventPriority, FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";
import { SkipOtherProcess } from "presentation-bot-kit/feature";

import { detectSpamMessage } from "../spamDetector";

export class MessageUpdateEvent extends FeatureEventBase<"messageUpdate"> {
  public override readonly event = "messageUpdate";
  public override readonly priority = EventPriority.Moderation;

  public override async handle(
    _oldMessage: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
    newMessage: OmitPartialGroupDMChannel<Message<boolean>>,
  ) {
    if (await detectSpamMessage(this.core, newMessage)) {
      return new SkipOtherProcess();
    }
  }
}
