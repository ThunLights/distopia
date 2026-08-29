import type { GuildMember } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class GuildMemberAddHandler extends BaseHandler<(member: GuildMember) => void> {
  public override async handle(member: GuildMember): Promise<void> {
    await this.core.member.addNewMember(member.guild.id, member.id);

    const banned = await this.enforceBlackList(member);

    if (banned) {
      return;
    }

    await this.logger.log(member.guild, "logMemberJoin", member);
    await this.welcomeMessenger.send(member.guild, member, "join");
  }

  private async enforceBlackList(member: GuildMember): Promise<boolean> {
    const matches = await this.core.blackList.matchOnJoin(member.guild.id, member.id);

    if (!matches.length) {
      return false;
    }

    let banned = false;

    if (matches.some((match) => match.banned) && member.bannable) {
      try {
        await member.ban({ reason: "ブラックリストに該当したため" });
        banned = true;
      } catch {
        // BANに失敗した場合もログは記録するため、ここでは処理を継続する
      }
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

    return banned;
  }
}
