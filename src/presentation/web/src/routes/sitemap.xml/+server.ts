import { database } from "$lib/server/database";
import type { RequestHandler } from "@sveltejs/kit";
import * as sitemap from "super-sitemap";

export const GET: RequestHandler = async () => {
  const publicGuildIds = (await database.guild.findAll())
    .filter(({ public: isPublic }) => isPublic)
    .map(({ guildId }) => guildId);

  return await sitemap.response({
    origin: "https://distopia.top",
    excludeRoutePatterns: ["^/api.*", "^/user.*", "^/auth.*"],
    paramValues: {
      "/guilds/[id]": publicGuildIds,
    },
    defaultChangefreq: "daily",
  });
};
