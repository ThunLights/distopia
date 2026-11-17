import type { Role } from "discord.js";
import { EventPriority, FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";

import { sendLog } from "../sendLog";

export class RoleCreateEvent extends FeatureEventBase<"roleCreate"> {
  public override readonly event = "roleCreate";
  public override readonly priority = EventPriority.Logging;

  public override async handle(role: Role) {
    await sendLog(this.core, role.guild, "logRoleCreate", role);
  }
}
