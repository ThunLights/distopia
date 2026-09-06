import type { GuildDictionary, GuildDictionaryUpsertInput } from "../types/GuildDictionary";
import { Base } from "./Base";

export class GuildDictionaryTable extends Base {
  public async findAll(guildId: string): Promise<GuildDictionary[]> {
    return await this.prisma.guildDictionary.findMany({ where: { guildId } });
  }

  public async upsert(input: GuildDictionaryUpsertInput): Promise<GuildDictionary> {
    return await this.prisma.guildDictionary.upsert({
      where: { guildId_word: { guildId: input.guildId, word: input.word } },
      update: input,
      create: input,
    });
  }

  public async delete(guildId: string, word: string): Promise<GuildDictionary> {
    return await this.prisma.guildDictionary.delete({
      where: { guildId_word: { guildId, word } },
    });
  }

  public async deleteAll(guildId: string): Promise<void> {
    await this.prisma.guildDictionary.deleteMany({ where: { guildId } });
  }

  // Deletes and recreates all of a guild's entries in one transaction, so a failure partway
  // through rolls back to the pre-replace state instead of leaving the dictionary emptied out
  // by the delete with only some of the new entries inserted.
  public async replaceAll(
    guildId: string,
    entries: { word: string; reading: string }[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.guildDictionary.deleteMany({ where: { guildId } }),
      ...entries.map(({ word, reading }) =>
        this.prisma.guildDictionary.create({ data: { guildId, word, reading } }),
      ),
    ]);
  }
}
