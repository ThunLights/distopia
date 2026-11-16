import { AuditLogEvent, type GuildMember, type PartialGuildMember } from "discord.js";
import { findRecentAuditLogEntry } from "presentation-bot-kit/logging/auditLog";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class GuildMemberRemoveHandler extends BaseHandler<
  (member: GuildMember | PartialGuildMember) => void
> {
  public override async handle(member: GuildMember | PartialGuildMember): Promise<void> {
    // A ban or kick isn't a voluntary leave -- no farewell message for those. Looked up before
    // the features run so their own delays can't push this past the audit-log recency window.
    const [banEntry, kickEntry] = await Promise.all([
      findRecentAuditLogEntry(member.guild, AuditLogEvent.MemberBanAdd, member.id),
      findRecentAuditLogEntry(member.guild, AuditLogEvent.MemberKick, member.id),
    ]);

    await emitFeatureEvent(this.core, "guildMemberRemove", member);

    if (banEntry || kickEntry) {
      return;
    }

    await this.welcomeMessenger.send(member.guild, member, "leave");
  }
}
