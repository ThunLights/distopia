import type { AppCore } from "app-core";
import { EmbedBuilder, type Guild } from "discord.js";

import type { LogFormat } from "./format";

const OVERFLOW_FIELDS_PER_EMBED = 5;

/** A GuildLogSetting column holding a log-destination channel ID. */
export type LogSettingField = Exclude<
  keyof NonNullable<Awaited<ReturnType<AppCore["log"]["getSetting"]>>>,
  "guildId"
>;

export class Logger {
  constructor(private readonly core: AppCore) {}

  public async log<A extends unknown[]>(
    guild: Guild,
    field: LogSettingField,
    format: LogFormat<A>,
    ...args: A
  ): Promise<void> {
    const settings = await this.core.log.getSetting(guild.id);

    await this.logToChannel(guild, settings?.[field], format, ...args);
  }

  public async logToChannel<A extends unknown[]>(
    guild: Guild,
    channelId: string | null | undefined,
    format: LogFormat<A>,
    ...args: A
  ): Promise<void> {
    try {
      if (!channelId) {
        return;
      }

      const channel = guild.channels.cache.get(channelId);

      if (!channel?.isSendable()) {
        return;
      }

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

      // Discord caps one embed at 6000 characters in total; 5 fields of up to 1024 each (plus
      // their names and the title) stay under that, so long content spills into more messages.
      const overflowFields = content.overflowFields ?? [];
      for (let i = 0; i < overflowFields.length; i += OVERFLOW_FIELDS_PER_EMBED) {
        const overflowEmbed = new EmbedBuilder()
          .setColor(format.color ?? "Navy")
          .setTitle(`${format.title} (続き)`)
          .addFields(overflowFields.slice(i, i + OVERFLOW_FIELDS_PER_EMBED))
          .setTimestamp();

        await channel.send({ embeds: [overflowEmbed] });
      }
    } catch (error) {
      console.error(`Failed to send log "${format.title}":`, error);
    }
  }
}
