import type { AppCore } from "app-core";
import { EmbedBuilder, type Guild } from "discord.js";

import type { LogField } from "./log";

export async function sendLog(
  core: AppCore,
  guild: Guild,
  field: LogField,
  title: string,
  description: string,
): Promise<void> {
  try {
    const settings = await core.guild.getSetting(guild.id);
    const channelId = settings?.[field];

    if (!channelId) {
      return;
    }

    const channel = guild.channels.cache.get(channelId);

    if (!channel?.isSendable()) {
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("Navy")
      .setTitle(title)
      .setDescription(description)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Failed to send log for ${field}:`, error);
  }
}
