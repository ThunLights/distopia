import type { GuildBan } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class GuildBanAddHandler extends BaseHandler<(ban: GuildBan) => void> {
  public override async handle(ban: GuildBan): Promise<void> {
    await this.logger.log(ban.guild, "logMemberBan", ban);
  }
}
