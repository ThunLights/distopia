import type { GuildMember } from "discord.js";

import { sendWelcomeMessage } from "../utils/welcomeMessage";
import { BaseHandler } from "./BaseHandler";

export class GuildMemberAddHandler extends BaseHandler<(member: GuildMember) => void> {
  public override async handle(member: GuildMember): Promise<void> {
    await this.core.member.addNewMember(member.guild.id, member.id);

    await this.logger.log(member.guild, "logMemberJoin", member);
    await sendWelcomeMessage(this.core, member.guild, member, "join");
  }
}
