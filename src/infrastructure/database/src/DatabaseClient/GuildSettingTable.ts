import type {
  GuildSetting,
  GuildSettingUpdateInput,
  GuildSettingUpsertInput,
} from "../types/GuildSetting";
import { Base } from "./Base";

export class GuildSettingTable extends Base {
  public async find(guildId: string): Promise<GuildSetting | null> {
    return await this.prisma.guildSetting.findUnique({
      where: { guildId },
    });
  }

  public async findAll(): Promise<GuildSetting[]> {
    return await this.prisma.guildSetting.findMany();
  }

  public async update(input: GuildSettingUpdateInput): Promise<GuildSetting> {
    return await this.prisma.guildSetting.update({
      where: { guildId: input.guildId },
      data: input,
    });
  }

  public async upsert(input: GuildSettingUpsertInput): Promise<GuildSetting> {
    return await this.prisma.guildSetting.upsert({
      where: { guildId: input.guildId },
      update: input,
      create: input,
    });
  }

  public async delete(guildId: string): Promise<GuildSetting> {
    return await this.prisma.guildSetting.delete({ where: { guildId } });
  }
}
