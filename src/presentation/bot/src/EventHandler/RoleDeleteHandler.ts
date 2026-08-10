import type { Role } from "discord.js";

import { sendLog } from "../utils/sendLog";
import { BaseHandler } from "./BaseHandler";

export class RoleDeleteHandler extends BaseHandler<(role: Role) => void> {
  public override async handle(role: Role): Promise<void> {
    await sendLog(
      this.core,
      role.guild,
      "logRoleDelete",
      "ロール削除",
      `${role.name} (${role.id}) が削除されました。`,
    );
  }
}
