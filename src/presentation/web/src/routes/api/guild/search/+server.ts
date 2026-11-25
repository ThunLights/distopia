import { core } from "#lib/server/core.js";
import { validateHandler } from "#lib/server/handler.js";
import { getTaggedGuilds } from "#lib/server/taggedGuilds.js";
import {
  PostBodySchema,
  type ResponseMethodPost,
} from "#lib/shared/types/routes/api/guild/search.js";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = await validateHandler(PostBodySchema, async (e, body) => {
  const nsfw = body.type === "all" ? undefined : body.type === "nsfw";

  // An empty term has nothing for the engine to match, so list every tagged guild by bump.
  if (body.serverTag && !body.term.trim()) {
    const started = performance.now();
    const guilds = (await getTaggedGuilds()).filter(
      (guild) => nsfw === undefined || guild.nsfw === nsfw,
    );
    return json(
      {
        guilds,
        count: guilds.length,
        time: `${Math.round(performance.now() - started)}ms`,
      } satisfies ResponseMethodPost,
      { status: 200 },
    );
  }

  const { guilds, count, time } = await core.guild.search(body.term, {
    filter: { nsfw, serverTag: body.serverTag },
  });

  return json(
    {
      guilds: guilds.map(({ guild, meta }) => ({
        guildId: guild.guildId,
        name: meta.name,
        invite: guild.invite,
        description: guild.description,
        tags: guild.tags,
        nsfw: guild.nsfw,
        boostCount: meta.serverBoostCount,
        serverTag: meta.tag ?? null,
        serverTagBadgeUrl: meta.tagBadgeUrl ?? null,
        iconUrl: meta.iconUrl ?? null,
        rank: core.record.getActiveRateRanking(guild.guildId) ?? null,
      })),
      count,
      time,
    } satisfies ResponseMethodPost,
    { status: 200 },
  );
});
