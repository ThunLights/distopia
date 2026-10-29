import type { AppCore } from "app-core";
import type { Message, OmitPartialGroupDMChannel } from "discord.js";

// Coalesces a burst of chat into one repost instead of deleting/sending on every message.
const REPOST_DELAY_MS = 5_000;
// channelId -> "a message arrived after the current repost started". Messages during the
// wait are already covered by the upcoming repost, but one landing while it's in flight may
// end up below the new copy, so that repost gets followed by another instead of dropping it.
// ponytail: in-process per-channel state, fine while presentation-bot is replicas: 1.
const channels = new Map<string, boolean>();

function run(core: AppCore, guildId: string, channelId: string): void {
  setTimeout(() => {
    channels.set(channelId, false);
    core.stickyMessage
      .repost(guildId, channelId)
      .catch((error) => console.error("[sticky] failed to repost", error))
      .finally(() => {
        if (channels.get(channelId)) {
          run(core, guildId, channelId);
        } else {
          channels.delete(channelId);
        }
      });
  }, REPOST_DELAY_MS);
}

export async function scheduleStickyRepost(
  core: AppCore,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
): Promise<void> {
  // Bots are skipped, not only this one: two sticky bots in one channel would otherwise
  // repost under each other forever.
  if (!message.inGuild() || message.author.bot) {
    return;
  }

  const { guildId, channelId } = message;
  if (channels.has(channelId)) {
    channels.set(channelId, true);
    return;
  }

  // Claimed before the lookup's await so two near-simultaneous messages can't both start a
  // repost loop for the same channel.
  channels.set(channelId, false);
  const sticky = await core.stickyMessage.find(guildId, channelId).catch((error) => {
    channels.delete(channelId);
    throw error;
  });
  if (!sticky) {
    channels.delete(channelId);
    return;
  }

  run(core, guildId, channelId);
}
