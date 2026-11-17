import type { GuildMember } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

export class GuildMemberAddEvent extends FeatureEventBase<"guildMemberAdd"> {
  public override readonly event = "guildMemberAdd";

  public override async handle(member: GuildMember) {
    await this.core.member.addNewMember(member.guild.id, member.id);
  }
}
