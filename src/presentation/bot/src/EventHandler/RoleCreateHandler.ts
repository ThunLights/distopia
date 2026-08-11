import type { Role } from "discord.js";

import { BaseHandler } from "./BaseHandler";

export class RoleCreateHandler extends BaseHandler<(role: Role) => void> {
  public override async handle(role: Role): Promise<void> {
    await this.logger.log(role.guild, "logRoleCreate", role);
  }
}
