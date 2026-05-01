import type { PermissionResolvable } from "discord.js";

import { Base } from "./Base";

export class GuildController extends Base {
  public async fetchHasPermissionUsers(guildId: string, permissions: PermissionResolvable[]) {
    return this.client.guilds.cache
      .get(guildId)
      ?.members.cache.filter((member) => member.permissions.has(permissions));
  }

  public async fetchOwner(guildId: string) {
    return await this.client.guilds.cache.get(guildId)?.fetchOwner({ cache: true });
  }
}
