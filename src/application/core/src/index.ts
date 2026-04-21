import { Base } from "./Base";
import { Guild } from "./Guild";

export class AppCore extends Base {
  public readonly guild = new Guild(this.appData);
}
