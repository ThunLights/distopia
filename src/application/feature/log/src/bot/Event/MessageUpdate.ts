import type { FeatureEventListener } from "presentation-bot-kit/feature";

import { sendLog } from "../sendLog";

export const messageUpdate: FeatureEventListener<"messageUpdate"> = async (
  core,
  oldMessage,
  newMessage,
) => {
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
    core,
    newMessage.guild,
    "logMessageEdit",
    newMessage,
    oldContent,
    newMessage.content,
    oldAttachments,
  );
};
