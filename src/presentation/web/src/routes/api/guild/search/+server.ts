import { core } from "$lib/server/core";
import { validateHandler } from "$lib/server/handler";
import { PostBodySchema, type ResponseMethodPost } from "$lib/shared/types/routes/api/guild/search";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = await validateHandler(PostBodySchema, async (e, body) => {
  const { guilds, count, time } = await core.guild.search(body.term, {
    filter: {
      nsfw: body.type === "all" ? undefined : body.type === "nsfw",
    },
  });

  return json(
    {
      guilds: guilds.map(({ guild, meta }) => ({
        guildId: guild.guildId,
        name: guild.name,
        invite: guild.invite,
        description: guild.description,
        tags: guild.tags,
        nsfw: guild.nsfw,
        boostCount: meta.serverBoostCount,
        iconUrl: meta.iconUrl ?? null,
        rank: core.record.getActiveRateRanking(guild.guildId) ?? null,
      })),
      count,
      time,
    } satisfies ResponseMethodPost,
    { status: 200 },
  );
});
