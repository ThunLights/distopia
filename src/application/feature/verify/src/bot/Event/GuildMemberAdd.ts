import type { GuildMember } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

export class GuildMemberAddEvent extends FeatureEventBase<"guildMemberAdd"> {
  public override readonly event = "guildMemberAdd";

  public override async handle(member: GuildMember) {
    const setting = await this.core.verify.getSetting(member.guild.id);
    if (setting?.enabled && setting.pendingRoleId) {
      try {
        await this.core.state.discord.role.give(member.guild.id, member.id, setting.pendingRoleId);
      } catch {
        // Role missing/above the bot's own role/missing permission, etc. -- the other features'
        // listeners (join log, welcome message) must still run.
      }
    }
  }
}
