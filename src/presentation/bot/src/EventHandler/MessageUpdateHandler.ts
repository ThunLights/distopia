import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";

import { detectSpamMessage } from "../utils/message";
import { BaseHandler } from "./BaseHandler";

export class MessageUpdateHandler extends BaseHandler<
  (
    oldMessage: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
    newMessage: OmitPartialGroupDMChannel<Message<boolean>>,
  ) => void
> {
  public override async handle(
    _oldMessage: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
    newMessage: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    const isDetected = await detectSpamMessage(this.core, newMessage);

    if (isDetected) {
      return;
    }
  }
}
