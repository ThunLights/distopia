import type { Client } from "discord.js";

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

// The AppState.discord shape (app-core/src/AppState.ts), implemented directly by Controller
// itself (presentation-bot, which owns the real logged-in Client) and, over Connect RPC, by
// presentation-web (see infra-rpc's BotService and presentation-web's lib/server/discord.ts).
// `channel`/`guild`/`role`/`user`/`message` (`guild.iconUrl` excepted) read discord.js's
// gateway-populated cache, which only exists in the process that actually logged in, so
// those go over RPC on the web side. `oauth2`, `embed`, and `guild.iconUrl` need no live
// cache (pure REST/CDN helpers) and stay a plain local implementation on both sides.
export type DiscordClient = {
  channel: Pick<
    ChannelController,
    "fetchVoiceChannel" | "rename" | "existsVoiceChannel" | "create"
  >;
  guild: Pick<
    GuildController,
    | "fetch"
    | "fetchOwnerId"
    | "fetchAdminIds"
    | "fetchMemberCount"
    | "fetchMemberCounts"
    | "fetchBoostCount"
    | "isJoined"
    | "iconUrl"
    | "fetchWhiteListTargetName"
  >;
  role: Pick<RoleController, "fetchGuild" | "give" | "deprive">;
  user: Pick<UserController, "find" | "setActivity">;
  message: Pick<MessageController, "edit">;
  oauth2: OAuth2Controller;
  embed: Pick<EmbedController, "detectInviteLinks">;
};

export type { FetchTokenResult, FetchUserInfoResult } from "./OAuth2Controller";
