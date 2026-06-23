import type { Client } from "discord.js";

import { AvatarController } from "./AvatarController";
import { Base } from "./Base";
import { ChannelController } from "./ChannelController";
import { EmbedController } from "./EmbedController";
import { GuildController } from "./GuildController";
import { MessageController } from "./MessageController";
import { OAuth2Controller } from "./OAuth2Controller";
import { RoleController } from "./RoleController";
import { UserController } from "./UserController";

export type Config = {
  id: string;
  secret: string;
  url: string;
  token: string;
};

export class Controller extends Base {
  public readonly avatar = new AvatarController(this.client);
  public readonly channel = new ChannelController(this.client);
  public readonly embed = new EmbedController(this.client);
  public readonly guild = new GuildController(this.client);
  public readonly message = new MessageController(this.client);
  public readonly role = new RoleController(this.client);
  public readonly user = new UserController(this.client);
  public readonly oauth2: OAuth2Controller;

  constructor(
    client: Client,
    public readonly config: Config,
  ) {
    super(client);
    this.oauth2 = new OAuth2Controller(this.client, this.config);
  }
}

export type { FetchTokenResult, FetchUserInfoResult } from "./OAuth2Controller";
