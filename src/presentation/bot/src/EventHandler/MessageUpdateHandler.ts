import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class MessageUpdateHandler extends BaseHandler<
  (
    oldMessage: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
    newMessage: OmitPartialGroupDMChannel<Message<boolean>>,
  ) => void
> {
  public override async handle(
    oldMessage: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
    newMessage: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    if (!newMessage.guild || newMessage.author.bot) {
      return;
    }

    await emitFeatureEvent(this.core, "messageUpdate", oldMessage, newMessage);
  }
}
