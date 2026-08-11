import type { DMChannel, NonThreadGuildBasedChannel } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class ChannelDeleteHandler extends BaseHandler<
  (channel: DMChannel | NonThreadGuildBasedChannel) => void
> {
  public override async handle(channel: DMChannel | NonThreadGuildBasedChannel): Promise<void> {
    if (channel.isDMBased()) {
      return;
    }

    await this.logger.log(channel.guild, "logChannelDelete", channel);
  }
}
