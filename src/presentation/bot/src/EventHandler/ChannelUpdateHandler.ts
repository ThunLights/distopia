import type { DMChannel, NonThreadGuildBasedChannel } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class ChannelUpdateHandler extends BaseHandler<
  (
    oldChannel: DMChannel | NonThreadGuildBasedChannel,
    newChannel: DMChannel | NonThreadGuildBasedChannel,
  ) => void
> {
  public override async handle(
    oldChannel: DMChannel | NonThreadGuildBasedChannel,
    newChannel: DMChannel | NonThreadGuildBasedChannel,
  ): Promise<void> {
    if (oldChannel.isDMBased() || newChannel.isDMBased()) {
      return;
    }

    const changes: string[] = [];

    if (oldChannel.name !== newChannel.name) {
      changes.push(`名前: ${oldChannel.name} → ${newChannel.name}`);
    }

    if ("topic" in oldChannel && "topic" in newChannel && oldChannel.topic !== newChannel.topic) {
      changes.push("トピックが変更されました。");
    }

    if (changes.length === 0) {
      return;
    }

    await sendLog(
      this.core,
      newChannel.guild,
      "logChannelEdit",
      "チャンネル編集",
      [`<#${newChannel.id}> (${newChannel.name}) が編集されました。`, ...changes].join("\n"),
    );
  }
}
