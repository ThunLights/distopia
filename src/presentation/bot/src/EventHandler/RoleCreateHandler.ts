import { type Role } from "discord.js";

import { emitFeatureEvent } from "../featureEvents";
import { BaseHandler } from "./BaseHandler";

export class RoleCreateHandler extends BaseHandler<(role: Role) => void> {
  public override async handle(role: Role): Promise<void> {
    await emitFeatureEvent(this.core, "roleCreate", role);
  }
}
