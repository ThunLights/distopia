import type { GuildMember, PartialGuildMember } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class GuildMemberRemoveHandler extends BaseHandler<
  (member: GuildMember | PartialGuildMember) => void
> {
  public override async handle(member: GuildMember | PartialGuildMember): Promise<void> {
    await emitFeatureEvent(this.core, "guildMemberRemove", member);
  }
}
