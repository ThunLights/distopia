import type { AppCore } from "app-core";
import { EmbedBuilder, type Guild } from "discord.js";

import type { AllLogField } from "./log";
import { logFormats, type LogFormat } from "./logFormats";

export class Logger {
  constructor(private readonly core: AppCore) {}

  public async log<F extends AllLogField>(
    guild: Guild,
    field: F,
    ...args: Parameters<(typeof logFormats)[F]["build"]>
  ): Promise<void> {
    try {
      const settings = await this.core.guild.getSetting(guild.id);
      const channelId = settings?.[field];

      if (!channelId) {
        return;
      }

      const channel = guild.channels.cache.get(channelId);

      if (!channel?.isSendable()) {
        return;
      }

      const format = logFormats[field] as LogFormat;
      const description = await format.build(...args);

      const embed = new EmbedBuilder()
        .setColor(format.color ?? "Navy")
        .setTitle(format.title)
        .setDescription(description)
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Failed to send log for ${field}:`, error);
    }
  }
}
