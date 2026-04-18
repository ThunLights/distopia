import type { GuildMember } from "infra-discord/prelude";
import { BaseHandler } from "./BaseHandler";

export class GuildMemberAdd extends BaseHandler<(member: GuildMember) => void> {
  public override async handle(_member: GuildMember): Promise<void> {}
}
