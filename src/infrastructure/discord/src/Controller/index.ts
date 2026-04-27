import { Base } from "./Base";
import { UserController } from "./UserController";

export class Controller extends Base {
  public readonly user = new UserController(this.client);
}
