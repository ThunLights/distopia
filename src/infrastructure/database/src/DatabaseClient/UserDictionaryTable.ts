import type { UserDictionary, UserDictionaryUpsertInput } from "../types/UserDictionary";
import { Base } from "./Base";

export class UserDictionaryTable extends Base {
  public async findAll(userId: string): Promise<UserDictionary[]> {
    return await this.prisma.userDictionary.findMany({ where: { userId } });
  }

  public async upsert(input: UserDictionaryUpsertInput): Promise<UserDictionary> {
    return await this.prisma.userDictionary.upsert({
      where: { userId_word: { userId: input.userId, word: input.word } },
      update: input,
      create: input,
    });
  }

  public async delete(userId: string, word: string): Promise<UserDictionary> {
    return await this.prisma.userDictionary.delete({
      where: { userId_word: { userId, word } },
    });
  }

  public async deleteAll(userId: string): Promise<void> {
    await this.prisma.userDictionary.deleteMany({ where: { userId } });
  }
}
