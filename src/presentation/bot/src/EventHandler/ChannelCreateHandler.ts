import type { NonThreadGuildBasedChannel } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class ChannelCreateHandler extends BaseHandler<
  (channel: NonThreadGuildBasedChannel) => void
> {
  public override async handle(channel: NonThreadGuildBasedChannel): Promise<void> {
    await sendLog(
      this.core,
      channel.guild,
      "logChannelCreate",
      "チャンネル作成",
      `<#${channel.id}> (${channel.name}) が作成されました。`,
    );
  }
}
