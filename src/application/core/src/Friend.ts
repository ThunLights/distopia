import type { FriendUpsertInput } from "infra-database/types";
import type { Value as FriendModel } from "repo-memory/Friend";

import { Base } from "./Base";

export class Friend extends Base {
  public sortedDatas: FriendModel[] = [];

  public async updateCache() {
    this.sortedDatas = await Promise.all(
      (await this.state.database.friend.findAllSortDate()).map(async (value) => {
        const avatarUrl = await this.state.discord.user.getAvatarUrl(value.userId);
        return {
          ...value,
          avatarUrl,
        };
      }),
    );
  }

  public async delete(userId: string) {
    this.state.memory.friend.delete(userId);
    await this.state.database.friend.delete(userId);
    await this.updateCache();
  }

  public async save(input: FriendUpsertInput) {
    const data = await this.state.database.friend.upsert(input);
    const avatarUrl = await this.state.discord.user.getAvatarUrl(input.userId);
    this.state.memory.friend.set(input.userId, { ...data, avatarUrl });
    await this.updateCache();
    return data;
  }

  public async find(userId: string) {
    const memCache = this.state.memory.friend.get(userId);

    if (memCache) {
      return memCache;
    }

    const dbData = await this.state.database.friend.find(userId);

    if (dbData) {
      const avatarUrl = await this.state.discord.user.getAvatarUrl(userId);
      this.state.memory.friend.set(dbData.userId, { ...dbData, avatarUrl });
    }

    return dbData;
  }

  public async findAll() {
    return await this.state.database.friend.findAll();
  }
}
