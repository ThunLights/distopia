import type { GuildStickyMessage } from "infra-database/types";
import type { DiscordClient } from "infra-discord";

import { Base } from "./Base";

type Embed = Parameters<DiscordClient["message"]["send"]>[1][number];

function toEmbed(content: string): Embed {
  return { title: "📌 ピン止めメッセージ", description: content, color: 0x2b2d31 };
}

export class StickyMessage extends Base {
  // Reposts of one channel run one at a time: two overlapping runs would both read the same
  // messageId and leave one posted copy untracked. Because save() queues behind an in-flight
  // repost, the last run always posts the newest content even if the row was replaced
  // meanwhile.
  // ponytail: process-local queue, fine while only presentation-bot (replicas: 1) reposts.
  private readonly queues = new Map<string, Promise<unknown>>();

  public async getAll(guildId: string): Promise<GuildStickyMessage[]> {
    const cached = await this.state.memory.guildStickyMessage.get(guildId);
    if (cached) {
      return cached.entries;
    }

    const entries = await this.state.database.guildStickyMessage.findAll(guildId);
    await this.state.memory.guildStickyMessage.set(guildId, { entries, createdAt: new Date() });
    return entries;
  }

  public async find(guildId: string, channelId: string): Promise<GuildStickyMessage | null> {
    const entries = await this.getAll(guildId);
    return entries.find((entry) => entry.channelId === channelId) ?? null;
  }

  // Saves, then posts right away so the admin sees the result. Returns false when the post
  // itself failed (e.g. missing permissions) -- the setting is kept either way.
  public async save(guildId: string, channelId: string, content: string): Promise<boolean> {
    await this.state.database.guildStickyMessage.upsert({ guildId, channelId, content });
    await this.state.memory.guildStickyMessage.delete(guildId);
    return await this.repost(guildId, channelId).catch(() => false);
  }

  // The posted copy is removed before the row, so a failed Discord delete (e.g. missing
  // permissions) keeps the messageId around for a retry instead of orphaning the message.
  public async delete(guildId: string, channelId: string): Promise<boolean> {
    const sticky = await this.find(guildId, channelId);
    if (sticky?.messageId) {
      const removed = await this.state.discord.message
        .delete(channelId, sticky.messageId)
        .then(() => true)
        .catch(() => false);
      if (!removed) {
        return false;
      }
    }

    await this.state.database.guildStickyMessage.delete(guildId, channelId);
    await this.state.memory.guildStickyMessage.delete(guildId);
    return true;
  }

  // Moves the sticky to the bottom of the channel: drops the previous copy, posts a new one.
  // Returns whether a copy is now posted.
  public repost(guildId: string, channelId: string): Promise<boolean> {
    const run = (this.queues.get(channelId) ?? Promise.resolve())
      .catch(() => {})
      .then(() => this.repostNow(guildId, channelId));
    this.queues.set(channelId, run);
    void run
      .finally(() => {
        if (this.queues.get(channelId) === run) {
          this.queues.delete(channelId);
        }
      })
      .catch(() => {});
    return run;
  }

  private async repostNow(guildId: string, channelId: string): Promise<boolean> {
    const sticky = await this.find(guildId, channelId);
    if (!sticky) {
      return false;
    }

    if (sticky.messageId) {
      await this.state.discord.message.delete(channelId, sticky.messageId);
    }

    const sent = await this.state.discord.message.send(channelId, [toEmbed(sticky.content)]);
    if (!sent) {
      return false;
    }

    let updated: GuildStickyMessage | null;
    try {
      updated = await this.state.database.guildStickyMessage.update({
        guildId,
        channelId,
        messageId: sent.id,
      });
    } catch (error) {
      await this.state.discord.message.delete(channelId, sent.id).catch(() => {});
      throw error;
    }
    await this.state.memory.guildStickyMessage.delete(guildId);

    // Removed while this repost was in flight -- don't leave an orphaned copy behind.
    if (!updated) {
      await this.state.discord.message.delete(channelId, sent.id);
      return false;
    }
    return true;
  }
}
