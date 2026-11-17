import { AuditLogEvent, type GuildMember, type PartialGuildMember } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";

import { WelcomeMessenger } from "../WelcomeMessenger";

export class GuildMemberRemoveEvent extends FeatureEventBase<"guildMemberRemove"> {
  public override readonly event = "guildMemberRemove";

  public override async handle(member: GuildMember | PartialGuildMember) {
    // A ban or kick isn't a voluntary leave -- no farewell message for those.
    const [banEntry, kickEntry] = await Promise.all([
      findRecentAuditLogEntry(member.guild, AuditLogEvent.MemberBanAdd, member.id),
      findRecentAuditLogEntry(member.guild, AuditLogEvent.MemberKick, member.id),
    ]);
    if (banEntry || kickEntry) {
      return;
    }

    await new WelcomeMessenger(this.core).send(member.guild, member, "leave");
  }
}
