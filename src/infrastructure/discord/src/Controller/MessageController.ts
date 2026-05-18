import { ChannelType, MessagePayload, type MessageEditOptions } from "discord.js";

import { Base } from "./Base";

export class MessageController extends Base {
  public async edit(
    channelId: string,
    messageId: string,
    content: string | MessageEditOptions | MessagePayload,
  ) {
    const channel = this.client.channels.cache.get(channelId);
    if (channel?.type === ChannelType.GuildText) {
      await channel.messages.cache.get(messageId)?.edit(content);
    }
  }
}
