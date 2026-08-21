import type { UserBlackList } from "../types/UserBlackList";
import { Base } from "./Base";

export class UserBlackListTable extends Base {
  public async find(id: number): Promise<UserBlackList | null> {
    return await this.prisma.userBlackList.findUnique({ where: { id } });
  }

  public async findAllByOwner(ownerId: string): Promise<UserBlackList[]> {
    return await this.prisma.userBlackList.findMany({ where: { ownerId } });
  }

  public async create(ownerId: string, label: string, tags: string[]): Promise<UserBlackList> {
    return await this.prisma.userBlackList.create({ data: { ownerId, label, tags } });
  }

  public async updateTags(id: number, tags: string[]): Promise<UserBlackList> {
    return await this.prisma.userBlackList.update({ where: { id }, data: { tags } });
  }

  public async delete(id: number): Promise<UserBlackList> {
    return await this.prisma.userBlackList.delete({ where: { id } });
  }
}
