import type { GuildLogSetting, GuildLogSettingUpsertInput } from "../types/GuildLogSetting";
import { Base } from "./Base";

export class GuildLogSettingTable extends Base {
  public async find(guildId: string): Promise<GuildLogSetting | null> {
    return await this.prisma.guildLogSetting.findUnique({
      where: { guildId },
    });
  }

  public async upsert(input: GuildLogSettingUpsertInput): Promise<GuildLogSetting> {
    return await this.prisma.guildLogSetting.upsert({
      where: { guildId: input.guildId },
      update: input,
      create: input,
    });
  }
}
