import type {
  GuildVerify,
  GuildVerifyUpdateInput,
  GuildVerifyUpsertInput,
} from "../types/GuildVerify";
import { Base } from "./Base";

export class GuildVerifyTable extends Base {
  public async find(guildId: string): Promise<GuildVerify | null> {
    return await this.prisma.guildVerify.findUnique({
      where: { guildId },
    });
  }

  public async findAll(): Promise<GuildVerify[]> {
    return await this.prisma.guildVerify.findMany();
  }

  public async update(input: GuildVerifyUpdateInput): Promise<GuildVerify> {
    return await this.prisma.guildVerify.update({
      where: { guildId: input.guildId },
      data: input,
    });
  }

  public async upsert(input: GuildVerifyUpsertInput): Promise<GuildVerify> {
    return await this.prisma.guildVerify.upsert({
      where: { guildId: input.guildId },
      update: input,
      create: input,
    });
  }

  public async delete(guildId: string): Promise<GuildVerify> {
    return await this.prisma.guildVerify.delete({ where: { guildId } });
  }
}
