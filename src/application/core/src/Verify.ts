import type { GuildVerify, GuildVerifyUpsertInput } from "infra-database/types";

import { Base } from "./Base";

export class Verify extends Base {
  public async getSetting(guildId: string): Promise<GuildVerify | null> {
    const cached = await this.state.memory.guildVerify.get(guildId);
    return cached ?? (await this.state.database.guildVerify.find(guildId));
  }

  public async saveSetting(input: GuildVerifyUpsertInput): Promise<GuildVerify> {
    const setting = await this.state.database.guildVerify.upsert(input);
    await this.state.memory.guildVerify.set(input.guildId, { ...setting, createdAt: new Date() });
    return setting;
  }
}
