import type { Role } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class RoleCreateHandler extends BaseHandler<(role: Role) => void> {
  public override async handle(role: Role): Promise<void> {
    await sendLog(
      this.core,
      role.guild,
      "logRoleCreate",
      "ロール作成",
      `<@&${role.id}> (${role.name}) が作成されました。`,
    );
  }
}
