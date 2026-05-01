import { Base } from "./Base";
import { Friend } from "./Friend";
import { Guild } from "./Guild";
import { Memory } from "./Memory";
import { Ranking } from "./Ranking";

export class AppCore extends Base {
  public readonly guild = new Guild(this.state);
  public readonly friend = new Friend(this.state);
  public readonly memory = new Memory(this.state);
  public readonly ranking = new Ranking(this.state);

  public async updateCache() {
    await this.ranking.updateCache();
  }
}
