import type { User } from "domain-model";
import type { User as DBUser } from "infra-database/types";

import { Base } from "./Base";

export class Ranking extends Base {
  public async fetchGuild(rankingType: "level" | "activeRate", num: number = 20) {
    return await this.state.database.guildRecord.ranking(rankingType, num);
  }

  public async fetchUser(rankingType: "userBump", num: number = 20): Promise<(User & DBUser)[]> {
    const users = [];

    const dbUsers = await this.state.database.user.ranking(rankingType, num);

    for (const user of dbUsers) {
      const discordUserData = await this.state.discord.user.find(user.id);
      if (discordUserData) {
        users.push({ ...discordUserData, ...user });
      }
    }

    return users;
  }
}
