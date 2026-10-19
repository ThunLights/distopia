import { core } from "$lib/server/core";
import type { ResponseMethodGet } from "$lib/shared/types/routes/api/ranking";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

const MAX_AGE_MS = 60_000;
let cached: { body: ResponseMethodGet; at: number } | null = null;
let refreshing: Promise<ResponseMethodGet> | null = null;

async function build(): Promise<ResponseMethodGet> {
  const { guild, user } = await core.ranking.fetchAll(100);
  return {
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
  };
}

// Stale-while-revalidate: only the very first request waits for the build.
function refresh() {
  refreshing ??= build()
    .then((body) => {
      cached = { body, at: Date.now() };
      return body;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export const GET: RequestHandler = async () => {
  if (!cached) {
    return json(await refresh(), { status: 200 });
  }
  if (Date.now() - cached.at > MAX_AGE_MS) {
    refresh().catch(() => {});
  }
  return json(cached.body, { status: 200 });
};
