import { core } from "$lib/server/core";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async (e) => {
  const { guildId } = await e.parent();

  const { meta, guild, record, reviews } = await core.guild.findWithAllRefData(guildId);

  if (!meta || !guild || !guild.public) {
    return error(404, { message: "Guild not found" });
  }

  return {
    guild: {
      guildId,
      name: meta.name,
      nsfw: guild.nsfw,
      description: guild.description,
      boostCount: meta.serverBoostCount,
      tags: guild.tags,
      iconUrl: meta.iconUrl,
      activeRate: Number(record?.activeRate ?? 0n),
      activeRateRank: record?.rank.activeRate ?? undefined,
      level: record?.level ?? undefined,
      point: record?.point ?? undefined,
      levelRank: record?.rank.level ?? undefined,
      maxActiveRateRank: record?.maxRateRank ?? undefined,
      maxActiveRate: record?.maxRate ?? undefined,
      maxLevelRank: record?.maxLevelRank ?? undefined,
      invite: guild.invite,
    },
    reviews: reviews
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map(({ userId, username, avatarUrl, star, content }) => ({
        userId,
        username,
        avatarUrl,
        star,
        content,
      })),
  };
};
