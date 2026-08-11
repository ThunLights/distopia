import type { GuildBan } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class GuildBanRemoveHandler extends BaseHandler<(ban: GuildBan) => void> {
  public override async handle(ban: GuildBan): Promise<void> {
    await sendLog(
      this.core,
      ban.guild,
      "logMemberUnban",
      "メンバーBAN解除",
      `<@${ban.user.id}> (${ban.user.id}) のBANが解除されました。`,
    );
  }
}
