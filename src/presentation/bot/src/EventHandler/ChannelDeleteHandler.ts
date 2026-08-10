import type { DMChannel, NonThreadGuildBasedChannel } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class ChannelDeleteHandler extends BaseHandler<
  (channel: DMChannel | NonThreadGuildBasedChannel) => void
> {
  public override async handle(channel: DMChannel | NonThreadGuildBasedChannel): Promise<void> {
    if (channel.isDMBased()) {
      return;
    }

    await sendLog(
      this.core,
      channel.guild,
      "logChannelDelete",
      "チャンネル削除",
      `${channel.name} (${channel.id}) が削除されました。`,
    );
  }
}
