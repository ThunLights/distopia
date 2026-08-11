import type { NonThreadGuildBasedChannel } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class ChannelCreateHandler extends BaseHandler<
  (channel: NonThreadGuildBasedChannel) => void
> {
  public override async handle(channel: NonThreadGuildBasedChannel): Promise<void> {
    await this.logger.log(channel.guild, "logChannelCreate", channel);
  }
}
