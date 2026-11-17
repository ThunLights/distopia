import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";
import { EventPriority, FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { sendLog } from "../sendLog";

export class MessageUpdateEvent extends FeatureEventBase<"messageUpdate"> {
  public override readonly event = "messageUpdate";
  public override readonly priority = EventPriority.Logging;

  public override async handle(
    oldMessage: OmitPartialGroupDMChannel<Message | PartialMessage>,
    newMessage: OmitPartialGroupDMChannel<Message>,
  ) {
    if (!newMessage.guild || newMessage.author.bot) {
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

    const oldContent = oldMessage.partial ? null : oldMessage.content;
    const oldAttachments = oldMessage.partial ? undefined : oldMessage.attachments;

    await sendLog(
      this.core,
      newMessage.guild,
      "logMessageEdit",
      newMessage,
      oldContent,
      newMessage.content,
      oldAttachments,
    );
  }
}
