import { core } from "$lib/server/core";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const { latestGuilds, activeGuilds } = core.guild.rootPage;

  return {
    latestGuilds: latestGuilds.map(({ guild, meta }) => ({
      guildId: guild.guildId,
      name: guild.name,
      description: guild.description,
      invite: guild.invite,
      nsfw: guild.nsfw,
      tags: guild.tags,
      iconUrl: meta.iconUrl,
      boostCount: meta.serverBoostCount,
      rank: core.record.getActiveRateRanking(guild.guildId) ?? null,
    })),
    activeGuilds: activeGuilds.map(({ guild, meta }) => ({
      guildId: guild.guildId,
      name: guild.name,
      description: guild.description,
      invite: guild.invite,
      nsfw: guild.nsfw,
      tags: guild.tags,
      iconUrl: meta.iconUrl,
      boostCount: meta.serverBoostCount,
      rank: core.record.getActiveRateRanking(guild.guildId) ?? null,
    })),
  };
};
