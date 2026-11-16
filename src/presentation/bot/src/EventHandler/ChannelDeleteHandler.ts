import { type DMChannel, type NonThreadGuildBasedChannel } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class ChannelDeleteHandler extends BaseHandler<
  (channel: DMChannel | NonThreadGuildBasedChannel) => void
> {
  public override async handle(channel: DMChannel | NonThreadGuildBasedChannel): Promise<void> {
    await emitFeatureEvent(this.core, "channelDelete", channel);
  }
}
