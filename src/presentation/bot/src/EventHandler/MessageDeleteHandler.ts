import type { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class MessageDeleteHandler extends BaseHandler<
  (message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>) => void
> {
  public override async handle(
    message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
  ): Promise<void> {
    if (!message.guild || message.partial || message.author.bot) {
      return;
    }

    const content = (message.content || "(空)").slice(0, 1000);

    await sendLog(
      this.core,
      message.guild,
      "logMessageDelete",
      "メッセージ削除",
      [
        `<@${message.author.id}> (${message.author.id}) のメッセージが削除されました。`,
        `チャンネル: <#${message.channelId}>`,
        `内容: ${content}`,
      ].join("\n"),
    );
  }
}
