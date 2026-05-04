import type { PermissionResolvable, PresenceStatus } from "discord.js";

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

  public async fetchMemberCount(guildId: string, status?: PresenceStatus[]) {
    const guild = this.client.guilds.cache.get(guildId);

    if (status) {
      return guild?.members.cache.filter(
        (member) => member.presence?.status && status.includes(member.presence.status),
      ).size;
    } else {
      return guild?.memberCount;
    }
  }

  public async fetchBoostCount(guildId: string) {
    return this.client.guilds.cache.get(guildId)?.premiumSubscriptionCount;
  }

  public async isJoined(guildId: string) {
    return this.client.guilds.cache.get(guildId) !== undefined;
  }
}
