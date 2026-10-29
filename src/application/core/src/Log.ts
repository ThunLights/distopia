import type { GuildLogSetting, GuildLogSettingUpsertInput } from "infra-database/types";

import { Base } from "./Base";

export class Log extends Base {
  public async getSetting(guildId: string): Promise<GuildLogSetting | null> {
    const cached = await this.state.memory.guildLogSetting.get(guildId);
    if (cached) {
      return cached;
    }

    // Read on every logged event, so fill the cache on a miss instead of hitting the DB each time.
    const setting = await this.state.database.guildLogSetting.find(guildId);
    if (setting) {
      await this.state.memory.guildLogSetting.set(guildId, { ...setting, createdAt: new Date() });
    }
    return setting;
  }

  public async saveSetting(input: GuildLogSettingUpsertInput): Promise<GuildLogSetting> {
    const setting = await this.state.database.guildLogSetting.upsert(input);
    await this.state.memory.guildLogSetting.set(input.guildId, {
      ...setting,
      createdAt: new Date(),
    });
    return setting;
  }
}
