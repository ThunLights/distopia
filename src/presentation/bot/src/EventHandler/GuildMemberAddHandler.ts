import type { GuildMember } from "discord.js";
import { blackListFormat } from "presentation-bot-kit/logging/blackListFormat";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class GuildMemberAddHandler extends BaseHandler<(member: GuildMember) => void> {
  public override async handle(member: GuildMember): Promise<void> {
    const banned = await this.enforceBlackList(member);

    if (banned) {
      return;
    }

    await emitFeatureEvent(this.core, "guildMemberAdd", member);
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
        // Ban failed, but the match should still be logged below -- swallow and continue.
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
        blackListFormat,
        member,
        channelMatches,
        banned,
      );
    }

    return banned;
  }
}
