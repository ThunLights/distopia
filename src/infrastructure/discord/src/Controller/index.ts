import { Base } from "./Base";
import { ChannelController } from "./ChannelController";
import { GuildController } from "./GuildController";
import { MessageController } from "./MessageController";
import { RoleController } from "./RoleController";
import { UserController } from "./UserController";

export class Controller extends Base {
  public readonly channel = new ChannelController(this.client);
  public readonly guild = new GuildController(this.client);
  public readonly message = new MessageController(this.client);
  public readonly role = new RoleController(this.client);
  public readonly user = new UserController(this.client);
}
