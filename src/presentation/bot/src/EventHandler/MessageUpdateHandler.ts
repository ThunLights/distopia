import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";

import { detectSpamMessage } from "../utils/message";
import { sendLog } from "../utils/sendLog";
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
    const isDetected = await detectSpamMessage(this.core, newMessage);

    if (isDetected) {
      return;
    }

    if (!newMessage.guild || newMessage.author.bot) {
      return;
    }

    if (!oldMessage.partial && oldMessage.content === newMessage.content) {
      return;
    }

    const oldContent = oldMessage.partial
      ? "(内容不明)"
      : (oldMessage.content || "(空)").slice(0, 1000);
    const newContent = (newMessage.content || "(空)").slice(0, 1000);

    await sendLog(
      this.core,
      newMessage.guild,
      "logMessageEdit",
      "メッセージ編集",
      [
        `<@${newMessage.author.id}> (${newMessage.author.id}) がメッセージを編集しました。`,
        `チャンネル: <#${newMessage.channelId}>`,
        `編集前: ${oldContent}`,
        `編集後: ${newContent}`,
      ].join("\n"),
    );
  }
}
