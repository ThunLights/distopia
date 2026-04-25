import type { Guild, GuildUpdateInput, GuildUpsertInput } from "../types/Guild";
import { Base } from "./Base";

export class GuildTable extends Base {
  public async find(guildId: string): Promise<Guild | null> {
    return await this.prisma.guild.findUnique({
      where: { guildId },
    });
  }

  public async update(input: GuildUpdateInput): Promise<Guild> {
    return await this.prisma.guild.update({
      where: { guildId: input.guildId },
      data: input,
    });
  }

  public async upsert(input: GuildUpsertInput): Promise<Guild> {
    return await this.prisma.guild.upsert({
      where: { guildId: input.guildId },
      update: input,
      create: input,
    });
  }

  public async delete(guildId: string): Promise<Guild> {
    return await this.prisma.guild.delete({ where: { guildId } });
  }
}
