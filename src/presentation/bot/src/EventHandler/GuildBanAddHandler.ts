import type { GuildBan } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class GuildBanAddHandler extends BaseHandler<(ban: GuildBan) => void> {
  public override async handle(ban: GuildBan): Promise<void> {
    await sendLog(
      this.core,
      ban.guild,
      "logMemberBan",
      "メンバーBAN",
      [`<@${ban.user.id}> (${ban.user.id}) がBANされました。`, ban.reason && `理由: ${ban.reason}`]
        .filter(Boolean)
        .join("\n"),
    );
  }
}
