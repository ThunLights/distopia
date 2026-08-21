import type { GuildMember } from "discord.js";

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

    let banned = false;

    if (matches.some((match) => match.banned) && member.bannable) {
      await member.ban({ reason: "ブラックリストに該当したため" });
      banned = true;
    }

    const matchesByChannel = new Map<string, typeof matches>();
    for (const match of matches) {
      if (!match.logChannel) {
        continue;
      }
      const channelMatches = matchesByChannel.get(match.logChannel) ?? [];
      channelMatches.push(match);
      matchesByChannel.set(match.logChannel, channelMatches);
    }

    for (const [channelId, channelMatches] of matchesByChannel) {
      await this.logger.logToChannel(
        member.guild,
        channelId,
        "logBlackList",
        member,
        channelMatches,
        banned,
      );
    }
  }
}
