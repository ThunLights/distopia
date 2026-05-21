import { core } from "$lib/server/core";
import type { LayoutServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async (e) => {
  const { user } = await e.parent();
  const guildId = e.params.id;

  const { guild, record, meta } = await core.guild.findWithRecord(guildId);

  if (!meta) {
    return redirect(302, "/user");
  }

  if (!(await core.guild.isOwnerOrAdmin(meta.id, user.id))) {
    return error(404, { message: "Guild not found" });
  }

  return {
    guildId,
    guild: guild && {
      name: guild.name,
      public: guild.public,
      description: guild.description,
      invite: guild.invite,
      tags: guild.tags,
      nsfw: guild.nsfw,
    },
    meta: {
      id: meta.id,
      name: meta.name,
      avatarUrl: meta.icon && core.guild.iconUrl(guildId, meta.icon),
    },
    record: record && {
      bumpCounter: record.bumpCounter,
      activeRate: record.activeRate,
      maxRate: record.maxRate,
      maxRateRank: record.maxRateRank,
      maxLevelRank: record.maxLevelRank,
      levelRank: record.rank.level,
      rateRank: record.rank.activeRate,
      level: record.level,
      point: record.point,
    },
  };
};
