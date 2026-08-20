import type { GuildMember } from "discord.js";

import type { BlackListAction } from "../utils/blackList";
import { sendWelcomeMessage } from "../utils/welcomeMessage";
import { BaseHandler } from "./BaseHandler";

export class GuildMemberAddHandler extends BaseHandler<(member: GuildMember) => void> {
  public override async handle(member: GuildMember): Promise<void> {
    await this.core.member.addNewMember(member.guild.id, member.id);

    await this.logger.log(member.guild, "logMemberJoin", member);
    await sendWelcomeMessage(this.core, member.guild, member, "join");

    await this.enforceBlackList(member);
  }

  private async enforceBlackList(member: GuildMember): Promise<void> {
    const matches = await this.core.blackList.matchOnJoin(member.guild.id, member.id);

    if (!matches.length) {
      return;
    }

    const configuredAction =
      this.core.blackList.strongestAction(matches.map((match) => match.action)) ?? "Log";

    let actionTaken: BlackListAction = "Log";

    if (configuredAction === "Ban" && member.bannable) {
      await member.ban({ reason: "ブラックリストに該当したため" });
      actionTaken = "Ban";
    } else if (configuredAction === "Kick" && member.kickable) {
      await member.kick("ブラックリストに該当したため");
      actionTaken = "Kick";
    }

    await this.logger.log(member.guild, "logBlackList", member, matches, actionTaken);
  }
}
