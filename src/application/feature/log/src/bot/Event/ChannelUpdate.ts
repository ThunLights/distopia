import type { DMChannel, NonThreadGuildBasedChannel } from "discord.js";
import { EventPriority, FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { sendLog } from "../sendLog";

export class ChannelUpdateEvent extends FeatureEventBase<"channelUpdate"> {
  public override readonly event = "channelUpdate";
  public override readonly priority = EventPriority.Logging;

  public override async handle(
    oldChannel: DMChannel | NonThreadGuildBasedChannel,
    newChannel: DMChannel | NonThreadGuildBasedChannel,
  ) {
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

    await sendLog(this.core, newChannel.guild, "logChannelEdit", newChannel, changes);
  }
}
