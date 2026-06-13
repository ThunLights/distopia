import { core } from "$lib/server/core";
import type { ResponseMethodGet } from "$lib/shared/types/routes/api/ranking";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
  const { guild, user } = await core.ranking.fetchAll(100);
  return json(
    {
      guild: {
        level: (await Promise.all(guild.level.map((g) => core.guild.rankingToGuildWithMeta(g))))
          .filter((guild) => guild !== null)
          .map((g) => ({
            ...g,
            activeRate: g.activeRate == null ? null : Number(g.activeRate),
            level: Number(g.level),
            point: Number(g.point),
          })),
        activeRate: (
          await Promise.all(guild.activeRate.map((g) => core.guild.rankingToGuildWithMeta(g)))
        )
          .filter((guild) => guild !== null)
          .map((g) => ({
            ...g,
            activeRate: g.activeRate == null ? null : Number(g.activeRate),
            level: Number(g.level),
            point: Number(g.point),
          })),
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
