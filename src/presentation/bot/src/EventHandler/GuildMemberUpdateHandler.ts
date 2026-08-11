import type { GuildMember, PartialGuildMember } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class GuildMemberUpdateHandler extends BaseHandler<
  (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => void
> {
  public override async handle(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
  ): Promise<void> {
    const now = Date.now();
    const oldUntil = oldMember.communicationDisabledUntilTimestamp;
    const newUntil = newMember.communicationDisabledUntilTimestamp;

    const wasTimedOut = oldUntil !== null && oldUntil > now;
    const isNewTimeout = newUntil !== null && newUntil > now && !wasTimedOut;

    if (!isNewTimeout) {
      return;
    }

    await this.logger.log(newMember.guild, "logMemberTimeout", newMember, newUntil);
  }
}
