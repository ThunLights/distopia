import type { Friend, FriendUpdateInput, FriendUpsertInput } from "../types/Friend";
import { Base } from "./Base";

export class FriendTable extends Base {
  public async find(userId: string): Promise<Friend | null> {
    return await this.prisma.friend.findUnique({
      where: { userId },
    });
  }

  public async upsert(input: FriendUpsertInput): Promise<Friend> {
    return await this.prisma.friend.upsert({
      where: { userId: input.userId },
      update: input,
      create: input,
    });
  }

  public async update(input: FriendUpdateInput): Promise<Friend> {
    return await this.prisma.friend.update({
      where: { userId: input.userId },
      data: input,
    });
  }

  public async delete(userId: string): Promise<Friend> {
    return await this.prisma.friend.delete({ where: { userId } });
  }
}
