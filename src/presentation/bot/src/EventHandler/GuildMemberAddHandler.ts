import type { GuildMember } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class GuildMemberAddHandler extends BaseHandler<(member: GuildMember) => void> {
  public override async handle(member: GuildMember): Promise<void> {
    await this.core.guild.addRecordNewMembers(member.guild.id, new Date(), member.id);
  }
}
