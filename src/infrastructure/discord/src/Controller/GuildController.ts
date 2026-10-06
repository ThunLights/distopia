import type { Guild } from "../types/Guild";
import { Base } from "./Base";

export class GuildController extends Base {
  // Only ever checked against "Administrator" -- see app-core's Guild.isOwnerOrAdmin /
  // OAuth2.isAdmin and AppCore.updateHomeGuild*Role. Returns ids only (not full GuildMember
  // objects) so this can also be served over RPC once presentation-bot owns the live client.
  public async fetchAdminIds(guildId: string): Promise<string[]> {
    return (
      this.client.guilds.cache
        .get(guildId)
        ?.members.cache.filter((member) => member.permissions.has("Administrator"))
        .map((member) => member.id) ?? []
    );
  }

  public async fetchOwnerId(guildId: string): Promise<string | undefined> {
    return (await this.client.guilds.cache.get(guildId)?.fetchOwner({ cache: true }))?.id;
  }

  public async fetchMemberCount(
    guildId: string,
    onlineOnly?: boolean,
  ): Promise<number | undefined> {
    const guild = this.client.guilds.cache.get(guildId);

    if (onlineOnly) {
      return guild?.members.cache.filter((member) => member.presence?.status === "online").size;
    } else {
      return guild?.memberCount;
    }
  }

  public async fetchMemberCounts(
    guildId: string,
  ): Promise<{ all: number; users: number; bots: number } | null> {
    const guild = this.client.guilds.cache.get(guildId);

    if (!guild) {
      return null;
    }

    const bots = guild.members.cache.filter((member) => member.user.bot).size;
    const all = guild.memberCount;

    return { all, users: all - bots, bots };
  }

  public async fetchBoostCount(guildId: string) {
    return this.client.guilds.cache.get(guildId)?.premiumSubscriptionCount;
  }

  public async isJoined(guildId: string) {
    return this.client.guilds.cache.get(guildId) !== undefined;
  }

  public async fetch(guildId: string): Promise<Guild | null> {
    const guild = this.client.guilds.cache.get(guildId);
    return guild
      ? {
          id: guildId,
          name: guild.name,
          ownerId: guild.ownerId,
          description: guild.description ?? undefined,
          icon: guild.icon ?? undefined,
          banner: guild.banner ?? undefined,
          iconUrl: guild.iconURL() ?? undefined,
          bannerUrl: guild.bannerURL() ?? undefined,
        }
      : null;
  }

  public iconUrl(guildId: string, iconHash: string) {
    return this.client.rest.cdn.icon(guildId, iconHash);
  }

  public async fetchWhiteListTargetName(
    guildId: string,
    idType: "ChannelId" | "RoleId" | "UserId",
    targetId: string,
  ): Promise<string | null> {
    const guild = this.client.guilds.cache.get(guildId);

    if (!guild) {
      return null;
    }

    if (idType === "ChannelId") {
      return guild.channels.cache.get(targetId)?.name ?? null;
    }

    if (idType === "RoleId") {
      return guild.roles.cache.get(targetId)?.name ?? null;
    }

    const member =
      guild.members.cache.get(targetId) ?? (await guild.members.fetch(targetId).catch(() => null));

    return member?.displayName ?? null;
  }
}
