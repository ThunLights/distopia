import { Base } from "./Base";
import { Guild } from "./Guild";
import { Ranking } from "./Ranking";

export class AppCore extends Base {
  public readonly guild = new Guild(this.state);
  public readonly ranking = new Ranking(this.state);
}
