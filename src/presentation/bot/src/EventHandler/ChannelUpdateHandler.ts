import { type DMChannel, type NonThreadGuildBasedChannel } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
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
    await emitFeatureEvent(this.core, "channelUpdate", oldChannel, newChannel);
  }
}
