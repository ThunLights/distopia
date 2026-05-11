import { core } from "$lib/server/core";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const { user } = await e.parent();
  const guilds = await core.oauth2.getGuilds(user.id);

  return {
    guilds: await Promise.all(
      (guilds ?? []).map(async (guild) => {
        const isBotJoined = await core.guild.isBotJoined(guild.id);
        const isPublic = await core.guild.isPublic(guild.id);
        return {
          ...guild,
          isBotJoined,
          isPublic,
        };
      }),
    ),
  };
};
