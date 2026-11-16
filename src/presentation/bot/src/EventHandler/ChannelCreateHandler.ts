import { type NonThreadGuildBasedChannel } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class ChannelCreateHandler extends BaseHandler<
  (channel: NonThreadGuildBasedChannel) => void
> {
  public override async handle(channel: NonThreadGuildBasedChannel): Promise<void> {
    await emitFeatureEvent(this.core, "channelCreate", channel);
  }
}
