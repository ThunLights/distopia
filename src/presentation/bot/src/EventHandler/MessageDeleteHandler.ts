import { type Message, type OmitPartialGroupDMChannel, type PartialMessage } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class MessageDeleteHandler extends BaseHandler<
  (message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>) => void
> {
  public override async handle(
    message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
  ): Promise<void> {
    await emitFeatureEvent(this.core, "messageDelete", message);
  }
}
