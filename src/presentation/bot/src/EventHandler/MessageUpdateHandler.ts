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
    oldMessage: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
    newMessage: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<void> {
    if (!newMessage.guild || newMessage.author.bot) {
      return;
    }

    const isDetected = await detectSpamMessage(this.core, this.logger, newMessage);

    if (isDetected) {
      return;
    }

    if (
      !oldMessage.partial &&
      oldMessage.content === newMessage.content &&
      oldMessage.attachments.size === newMessage.attachments.size &&
      oldMessage.attachments.every((attachment) => newMessage.attachments.has(attachment.id))
    ) {
      return;
    }

    const oldContent = oldMessage.partial ? "(内容不明)" : oldMessage.content || "(空)";
    const newContent = newMessage.content || "(空)";
    const oldAttachments = oldMessage.partial ? undefined : oldMessage.attachments;

    await this.logger.log(
      newMessage.guild,
      "logMessageEdit",
      newMessage,
      oldContent,
      newContent,
      oldAttachments,
    );
  }
}
