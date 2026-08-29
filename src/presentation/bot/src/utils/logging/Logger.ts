import type { AppCore } from "app-core";
import { EmbedBuilder, type Guild } from "discord.js";

import type { AllLogField, ChannelLogField } from "./log";
import { logFormats, type LogFormat } from "./logFormats";

export class Logger {
  constructor(private readonly core: AppCore) {}

  public async log<F extends AllLogField>(
    guild: Guild,
    field: F,
    ...args: Parameters<(typeof logFormats)[F]["build"]>
  ): Promise<void> {
    const settings = await this.core.guild.getSetting(guild.id);

    await this.send(guild, settings?.[field], field, args);
  }

  public async logToChannel<F extends ChannelLogField>(
    guild: Guild,
    channelId: string,
    field: F,
    ...args: Parameters<(typeof logFormats)[F]["build"]>
  ): Promise<void> {
    await this.send(guild, channelId, field, args);
  }

  private async send<F extends AllLogField | ChannelLogField>(
    guild: Guild,
    channelId: string | null | undefined,
    field: F,
    args: Parameters<(typeof logFormats)[F]["build"]>,
  ): Promise<void> {
    try {
      if (!channelId) {
        return;
      }

      const channel = guild.channels.cache.get(channelId);

      if (!channel?.isSendable()) {
        return;
      }

      const format = logFormats[field] as LogFormat;
      const content = await format.build(...args);

      const embed = new EmbedBuilder()
        .setColor(format.color ?? "Navy")
        .setTitle(format.title)
        .setDescription(content.description)
        .setTimestamp();

      if (content.image) {
        embed.setImage(content.image);
      }

      if (content.fields?.length) {
        embed.addFields(content.fields);
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send log for ${field}:`, error);
    }
  }
}
