import type { GuildMember } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { WelcomeMessenger } from "../WelcomeMessenger";

export class GuildMemberAddEvent extends FeatureEventBase<"guildMemberAdd"> {
  public override readonly event = "guildMemberAdd";

  public override async handle(member: GuildMember) {
    await new WelcomeMessenger(this.core).send(member.guild, member, "join");
  }
}
