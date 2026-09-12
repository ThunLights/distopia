import { Prisma } from "../prisma-client/client";
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

  // Returns null (rather than throwing) when the word doesn't exist -- deleting an
  // already-removed or never-registered word is a normal "not found" outcome for callers,
  // not a crash.
  public async delete(userId: string, word: string): Promise<UserDictionary | null> {
    try {
      return await this.prisma.userDictionary.delete({
        where: { userId_word: { userId, word } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  public async deleteAll(userId: string): Promise<void> {
    await this.prisma.userDictionary.deleteMany({ where: { userId } });
  }
}
