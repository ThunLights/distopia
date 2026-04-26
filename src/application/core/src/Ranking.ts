import { Base } from "./Base";

export class Ranking extends Base {
  public async fetchGuild(rankingType: "level" | "activeRate", num: number = 20) {
    return await this.state.database.guildRecord.ranking(rankingType, num);
  }

  public async fetchUser(rankingType: "userBump", num: number = 20) {
    return await this.state.database.user.ranking(rankingType, num);
  }
}
