import type { GuildMember } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class GuildMemberAddHandler extends BaseHandler<(member: GuildMember) => void> {
  public override async handle(member: GuildMember): Promise<void> {
    await this.core.member.addNewMember(member.guild.id, member.id);

    await sendLog(
      this.core,
      member.guild,
      "logMemberJoin",
      "メンバー参加",
      `<@${member.id}> (${member.id}) がサーバーに参加しました。`,
    );
  }
}
