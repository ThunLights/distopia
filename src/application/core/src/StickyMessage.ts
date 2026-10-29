import type { GuildStickyMessage } from "infra-database/types";
import type { DiscordClient } from "infra-discord";

import { Base } from "./Base";

type Embed = Parameters<DiscordClient["message"]["send"]>[1][number];

function toEmbed(content: string): Embed {
  return { title: "📌 ピン止めメッセージ", description: content, color: 0x2b2d31 };
}

export class StickyMessage extends Base {
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
    return await this.repost(guildId, channelId).then(
      () => true,
      () => false,
    );
  }

  public async delete(guildId: string, channelId: string): Promise<void> {
    const deleted = await this.state.database.guildStickyMessage.delete(guildId, channelId);
    await this.state.memory.guildStickyMessage.delete(guildId);
    if (deleted?.messageId) {
      await this.state.discord.message.delete(channelId, deleted.messageId);
    }
  }

  // Moves the sticky to the bottom of the channel: drops the previous copy, posts a new one.
  public async repost(guildId: string, channelId: string): Promise<void> {
    const sticky = await this.find(guildId, channelId);
    if (!sticky) {
      return;
    }

    if (sticky.messageId) {
      await this.state.discord.message.delete(channelId, sticky.messageId);
    }

    const sent = await this.state.discord.message.send(channelId, [toEmbed(sticky.content)]);
    if (!sent) {
      return;
    }

    const updated = await this.state.database.guildStickyMessage.update({
      guildId,
      channelId,
      messageId: sent.id,
    });
    await this.state.memory.guildStickyMessage.delete(guildId);

    // Removed while this repost was in flight -- don't leave an orphaned copy behind.
    if (!updated) {
      await this.state.discord.message.delete(channelId, sent.id);
    }
  }
}
