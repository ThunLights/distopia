import type { FriendUpsertInput } from "infra-database/types";
import type { Value as FriendModel } from "repo-memory/Friend";

import { Base } from "./Base";

export class Friend extends Base {
  public sortedDatas: FriendModel[] = [];

  public async updateCache() {
    this.sortedDatas = (
      await Promise.all(
        (
          await this.state.database.friend.findAllSortDate()
        ).map(async (value) => {
          const user = await this.state.discord.user.find(value.userId);
          if (!user) {
            return null;
          }
          return {
            ...value,
            username: user.name,
            avatarUrl: user.avatarUrl ?? null,
          };
        }),
      )
    ).filter((guild) => guild !== null);
  }

  public async delete(userId: string) {
    this.state.memory.friend.delete(userId);
    await this.state.database.friend.delete(userId);
    await this.updateCache();
  }

  public async save(input: FriendUpsertInput) {
    const user = await this.state.discord.user.find(input.userId);
    if (user) {
      const data = await this.state.database.friend.upsert(input);
      this.state.memory.friend.set(input.userId, {
        ...data,
        avatarUrl: user.avatarUrl ?? null,
        username: user.name,
      });
      await this.updateCache();
      return data;
    } else {
      return null;
    }
  }

  public async find(userId: string) {
    const memCache = this.state.memory.friend.get(userId);

    if (memCache) {
      return memCache;
    }

    const dbData = await this.state.database.friend.find(userId);

    if (dbData) {
      const user = await this.state.discord.user.find(dbData.userId);
      if (!user) {
        return null;
      }
      this.state.memory.friend.set(dbData.userId, {
        ...dbData,
        avatarUrl: user.avatarUrl ?? null,
        username: user.name,
      });
    }

    return dbData;
  }

  public async findAll() {
    return await this.state.database.friend.findAll();
  }
}
