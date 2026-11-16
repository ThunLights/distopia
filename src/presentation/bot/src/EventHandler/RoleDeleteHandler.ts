import { type Role } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class RoleDeleteHandler extends BaseHandler<(role: Role) => void> {
  public override async handle(role: Role): Promise<void> {
    await emitFeatureEvent(this.core, "roleDelete", role);
  }
}
