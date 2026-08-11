import type { GuildMember, PartialGuildMember } from "discord.js";

import { sendLog } from "../utils/sendLog";
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

    await sendLog(
      this.core,
      newMember.guild,
      "logMemberTimeout",
      "メンバータイムアウト",
      [
        `<@${newMember.id}> (${newMember.id}) がタイムアウトされました。`,
        `解除予定: <t:${Math.floor(newUntil / 1000)}:F>`,
      ].join("\n"),
    );
  }
}
