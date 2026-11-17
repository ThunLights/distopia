import type { Role } from "discord.js";
import { EventPriority, FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { sendLog } from "../sendLog";

export class RoleDeleteEvent extends FeatureEventBase<"roleDelete"> {
  public override readonly event = "roleDelete";
  public override readonly priority = EventPriority.Logging;

  public override async handle(role: Role) {
    await sendLog(this.core, role.guild, "logRoleDelete", role);
  }
}
