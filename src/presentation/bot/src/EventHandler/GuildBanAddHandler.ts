import { type GuildBan } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class GuildBanAddHandler extends BaseHandler<(ban: GuildBan) => void> {
  public override async handle(ban: GuildBan): Promise<void> {
    await emitFeatureEvent(this.core, "guildBanAdd", ban);
  }
}
