import type { AppCore } from "app-core";
import type { GuildSettingUpsertInput } from "infra-database/types";

export const STAT_CHANNEL_FIELDS = [
  "statChannelAllMembers",
  "statChannelUsers",
  "statChannelBots",
  "statChannelActiveRate",
  "statChannelActiveRateRanking",
] as const;

export type StatChannelField = (typeof STAT_CHANNEL_FIELDS)[number];

export function isStatChannelField(value: string): value is StatChannelField {
  return (STAT_CHANNEL_FIELDS as readonly string[]).includes(value);
}

async function buildName(core: AppCore, guildId: string, field: StatChannelField) {
  if (
    field === "statChannelAllMembers" ||
    field === "statChannelUsers" ||
    field === "statChannelBots"
  ) {
    const counts = await core.state.discord.guild.fetchMemberCounts(guildId);

    if (field === "statChannelAllMembers") {
      return `全メンバー: ${counts?.all ?? 0}`;
    }
    if (field === "statChannelUsers") {
      return `ユーザー: ${counts?.users ?? 0}`;
    }
    return `Bot: ${counts?.bots ?? 0}`;
  }

  if (field === "statChannelActiveRate") {
    const record = await core.state.database.guildRecord.find(guildId);
    return `アクティブレート: ${record?.activeRate ?? 0}`;
  }

  const rank = core.record.getActiveRateRanking(guildId);
  return `アクティブレート順位: ${rank ? `${rank}位` : "圏外"}`;
}

export async function updateStatChannels(core: AppCore) {
  for (const setting of await core.state.database.guildSetting.findAll()) {
    for (const field of STAT_CHANNEL_FIELDS) {
      const channelId = setting[field];

      if (!channelId) {
        continue;
      }

      try {
        const exists = await core.state.discord.channel.rename(
          channelId,
          await buildName(core, setting.guildId, field),
        );

        if (!exists) {
          await core.state.database.guildSetting.upsert({
            guildId: setting.guildId,
            [field]: null,
          });
        }
      } catch (error) {
        console.error(
          `Failed to update stat channel ${field} for guild ${setting.guildId}:`,
          error,
        );
      }
    }
  }
}

export async function assignStatChannel(
  core: AppCore,
  guildId: string,
  field: StatChannelField,
  channelId: string,
) {
  const setting = await core.guild.getSetting(guildId);
  const input: GuildSettingUpsertInput = { guildId, [field]: channelId };

  for (const otherField of STAT_CHANNEL_FIELDS) {
    if (otherField !== field && setting?.[otherField] === channelId) {
      input[otherField] = null;
    }
  }

  return await core.guild.saveSetting(input);
}

export async function setupStatChannels(
  core: AppCore,
  guildId: string,
  fields: readonly StatChannelField[] = STAT_CHANNEL_FIELDS,
) {
  const setting = await core.state.database.guildSetting.find(guildId);

  for (const field of fields) {
    const channelId = setting?.[field];

    if (channelId && (await core.state.discord.channel.existsVoiceChannel(channelId))) {
      continue;
    }

    const channel = await core.state.discord.channel.create(
      guildId,
      await buildName(core, guildId, field),
    );

    if (channel) {
      await core.state.database.guildSetting.upsert({ guildId, [field]: channel.id });
    }
  }
}
