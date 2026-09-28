import {
  ChannelType,
  DiscordAPIError,
  MessagePayload,
  RESTJSONErrorCodes,
  type MessageEditOptions,
} from "discord.js";

import { Base } from "./Base";

export class MessageController extends Base {
  public async edit(
    channelId: string,
    messageId: string,
    content: string | MessageEditOptions | MessagePayload,
  ) {
    const channel = this.client.channels.cache.get(channelId);
    if (channel?.type !== ChannelType.GuildText) {
      return;
    }

    // .cache.get() only ever finds a message discord.js already holds in memory (e.g. one
    // it just received a gateway event for) -- discord.js's message cache is a bounded
    // LimitedCollection (default 200/channel) with no time-based expiry, and every gateway
    // reconnect/bot restart starts it empty. A panel message that nobody replies to or
    // reacts to (this is the only path that ever touches it again) falls out of cache
    // permanently, and .cache.get()?.edit(...) then silently no-ops forever -- no thrown
    // error, nothing logged. .fetch() checks the cache first and only hits the REST API on
    // a miss, so this keeps working after a restart.
    let message;
    try {
      message = await channel.messages.fetch(messageId);
    } catch (error) {
      // Only a genuinely deleted message (Unknown Message) is expected and fine to no-op
      // on -- anything else (rate limit, missing permissions, a real API outage) means the
      // message is probably still there and callers need to know the edit didn't happen,
      // so it must propagate rather than being swallowed alongside the deleted case.
      if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
        return;
      }
      throw error;
    }

    await message.edit(content);
  }
}
