import type { Role } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class RoleDeleteHandler extends BaseHandler<(role: Role) => void> {
  public override async handle(role: Role): Promise<void> {
    await this.logger.log(role.guild, "logRoleDelete", role);
  }
}
