import type { AppState } from "./AppState";
import { Base } from "./Base";
import type { Record } from "./Record";

type StatChannelField =
  | "statChannelAllMembers"
  | "statChannelUsers"
  | "statChannelBots"
  | "statChannelActiveRate"
  | "statChannelActiveRateRanking";

const STAT_CHANNEL_FIELDS: StatChannelField[] = [
  "statChannelAllMembers",
  "statChannelUsers",
  "statChannelBots",
  "statChannelActiveRate",
  "statChannelActiveRateRanking",
];

export class StatChannel extends Base {
  constructor(
    state: AppState,
    private readonly record: Record,
  ) {
    super(state);
  }

  private async buildName(guildId: string, field: StatChannelField): Promise<string> {
    if (
      field === "statChannelAllMembers" ||
      field === "statChannelUsers" ||
      field === "statChannelBots"
    ) {
      const counts = await this.state.discord.guild.fetchMemberCounts(guildId);

      if (field === "statChannelAllMembers") {
        return `全メンバー: ${counts?.all ?? 0}`;
      }
      if (field === "statChannelUsers") {
        return `ユーザー: ${counts?.users ?? 0}`;
      }
      return `Bot: ${counts?.bots ?? 0}`;
    }

    if (field === "statChannelActiveRate") {
      const record = await this.state.database.guildRecord.find(guildId);
      return `アクティブレート: ${record?.activeRate ?? 0}`;
    }

    const rank = this.record.getActiveRateRanking(guildId);
    return `アクティブレート順位: ${rank ? `${rank}位` : "圏外"}`;
  }

  public async update() {
    for (const setting of await this.state.database.guildSetting.findAll()) {
      for (const field of STAT_CHANNEL_FIELDS) {
        const channelId = setting[field];

        if (!channelId) {
          continue;
        }

        const exists = await this.state.discord.channel.rename(
          channelId,
          await this.buildName(setting.guildId, field),
        );

        if (!exists) {
          await this.state.database.guildSetting.upsert({
            guildId: setting.guildId,
            [field]: null,
          });
        }
      }
    }
  }

  public async setupAll(guildId: string) {
    const setting = await this.state.database.guildSetting.find(guildId);

    for (const field of STAT_CHANNEL_FIELDS) {
      const channelId = setting?.[field];

      if (channelId && this.state.discord.channel.existsVoiceChannel(channelId)) {
        continue;
      }

      const channel = await this.state.discord.channel.create(
        guildId,
        await this.buildName(guildId, field),
      );

      if (channel) {
        await this.state.database.guildSetting.upsert({ guildId, [field]: channel.id });
      }
    }
  }
}
