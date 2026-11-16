import type { Message, OmitPartialGroupDMChannel } from "discord.js";

import { codeBlock } from "../codeblock";
import type { LogFormat } from "./format";

export const antiRaidFormat: LogFormat<
  [message: OmitPartialGroupDMChannel<Message<boolean>>, inviteLinks: string[]]
> = {
  title: "荒らし対策: 招待リンクを検知しました",
  color: "Red",
  build: async (message, inviteLinks) => ({
    description: [
      `ユーザー: <@${message.author.id}> (${message.author.id})`,
      `チャンネル: <#${message.channelId}>`,
    ].join("\n"),
    fields: [{ name: "検知したリンク", value: await codeBlock(inviteLinks.join("\n")) }],
  }),
};
