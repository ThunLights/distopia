import { core } from "$lib/server/core";
import type { ResponseMethodGet } from "$lib/shared/types/routes/api/ranking";
import { json } from "@sveltejs/kit";

export const GET = async () => {
  const { guild, user } = await core.ranking.fetchAll(100);
  return json(
    {
      guild: {
        level: await Promise.all(
          guild.level.map((guild) => core.guild.rankingToGuildWithMeta(guild)),
        ),
        activeRate: await Promise.all(
          guild.activeRate.map((guild) => core.guild.rankingToGuildWithMeta(guild)),
        ),
      },
      user: {
        bump: user.bump.map(({ id, displayName, name, avatarUrl, bumpCounter }) => ({
          id,
          displayName,
          avatarUrl,
          bumpCounter,
          username: name,
        })),
      },
    } satisfies ResponseMethodGet,
    { status: 200 },
  );
};
