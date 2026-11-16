import type { NonThreadGuildBasedChannel } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { sendLog } from "../sendLog";

export class ChannelCreateEvent extends FeatureEventBase<"channelCreate"> {
  public override readonly event = "channelCreate";

  public override async handle(channel: NonThreadGuildBasedChannel) {
    await sendLog(this.core, channel.guild, "logChannelCreate", channel);
  }
}
