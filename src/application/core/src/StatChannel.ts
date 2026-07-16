import type { AppState } from "./AppState";
import { Base } from "./Base";
import type { Record } from "./Record";

export class StatChannel extends Base {
  constructor(
    state: AppState,
    private readonly record: Record,
  ) {
    super(state);
  }

  public async update() {
    for (const setting of await this.state.database.guildSetting.findAll()) {
      const { guildId } = setting;

      if (setting.statChannelAllMembers || setting.statChannelUsers || setting.statChannelBots) {
        const counts = await this.state.discord.guild.fetchMemberCounts(guildId);

        if (counts) {
          if (setting.statChannelAllMembers) {
            await this.state.discord.channel.rename(
              setting.statChannelAllMembers,
              `全メンバー: ${counts.all}`,
            );
          }
          if (setting.statChannelUsers) {
            await this.state.discord.channel.rename(
              setting.statChannelUsers,
              `ユーザー: ${counts.users}`,
            );
          }
          if (setting.statChannelBots) {
            await this.state.discord.channel.rename(setting.statChannelBots, `Bot: ${counts.bots}`);
          }
        }
      }

      if (setting.statChannelActiveRate) {
        const record = await this.state.database.guildRecord.find(guildId);

        await this.state.discord.channel.rename(
          setting.statChannelActiveRate,
          `アクティブレート: ${record?.activeRate ?? 0}`,
        );
      }

      if (setting.statChannelActiveRateRanking) {
        const rank = this.record.getActiveRateRanking(guildId);

        await this.state.discord.channel.rename(
          setting.statChannelActiveRateRanking,
          `アクティブレート順位: ${rank ? `${rank}位` : "圏外"}`,
        );
      }
    }
  }
}
