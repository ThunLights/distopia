import { type Role } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class RoleUpdateHandler extends BaseHandler<(oldRole: Role, newRole: Role) => void> {
  public override async handle(oldRole: Role, newRole: Role): Promise<void> {
    await emitFeatureEvent(this.core, "roleUpdate", oldRole, newRole);
  }
}
