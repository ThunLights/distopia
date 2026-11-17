import type { Message, OmitPartialGroupDMChannel } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { scheduleStickyRepost } from "../stickyMessage";

export class MessageCreateEvent extends FeatureEventBase<"messageCreate"> {
  public override readonly event = "messageCreate";

  public override async handle(message: OmitPartialGroupDMChannel<Message>) {
    await scheduleStickyRepost(this.core, message);
  }
}
