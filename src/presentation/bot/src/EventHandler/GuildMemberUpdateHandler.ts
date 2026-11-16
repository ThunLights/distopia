import { type GuildMember, type PartialGuildMember } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class GuildMemberUpdateHandler extends BaseHandler<
  (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => void
> {
  public override async handle(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
  ): Promise<void> {
    await emitFeatureEvent(this.core, "guildMemberUpdate", oldMember, newMember);
  }
}
