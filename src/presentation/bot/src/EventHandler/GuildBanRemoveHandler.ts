import type { GuildBan } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class GuildBanRemoveHandler extends BaseHandler<(ban: GuildBan) => void> {
  public override async handle(ban: GuildBan): Promise<void> {
    await this.logger.log(ban.guild, "logMemberUnban", ban);
  }
}
