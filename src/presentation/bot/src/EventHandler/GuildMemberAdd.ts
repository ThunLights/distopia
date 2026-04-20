import type { GuildMember } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class GuildMemberAdd extends BaseHandler<(member: GuildMember) => void> {
  public override async handle(_member: GuildMember): Promise<void> {}
}
