import type { GuildMember } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { sendLog } from "../sendLog";

export class GuildMemberAddEvent extends FeatureEventBase<"guildMemberAdd"> {
  public override readonly event = "guildMemberAdd";

  public override async handle(member: GuildMember) {
    await sendLog(this.core, member.guild, "logMemberJoin", member);
  }
}
