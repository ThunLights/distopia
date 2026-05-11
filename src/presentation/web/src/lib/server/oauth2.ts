import { core } from "./core";

export async function getGuilds(userId: string, noCache: boolean = false) {
  const guilds = noCache
    ? await core.oauth2.getGuildsWithUpdateCache(userId)
    : await core.oauth2.getGuilds(userId);

  return await Promise.all(
    (guilds ?? []).map(async (guild) => {
      const isBotJoined = await core.guild.isBotJoined(guild.id);
      const isPublic = await core.guild.isPublic(guild.id);
      return {
        ...guild,
        isBotJoined,
        isPublic,
      };
    }),
  );
}
