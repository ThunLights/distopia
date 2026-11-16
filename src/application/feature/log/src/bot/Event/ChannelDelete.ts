import type { DMChannel, NonThreadGuildBasedChannel } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { sendLog } from "../sendLog";

export class ChannelDeleteEvent extends FeatureEventBase<"channelDelete"> {
  public override readonly event = "channelDelete";

  public override async handle(channel: DMChannel | NonThreadGuildBasedChannel) {
    if (channel.isDMBased()) {
      return;
    }

    await sendLog(this.core, channel.guild, "logChannelDelete", channel);
  }
}
