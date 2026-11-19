import { core } from "#lib/server/core.js";
import { authAndValidateHandler } from "#lib/server/handler.js";
import { errorJson } from "#lib/server/res.js";
import { PostBodySchema } from "#lib/shared/types/routes/api/guild/join.js";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = await authAndValidateHandler(
  PostBodySchema,
  async (e, body) => {
    // The bot can add a user to any guild it's in via guilds.join, so only listed guilds may
    // be joined this way -- same visibility rule as the /guilds/[id] page.
    if (!(await core.guild.isPublic(body.guildId))) {
      return errorJson("サーバーが見つかりませんでした");
    }

    const result = await core.oauth2.joinGuild(e.locals.user.id, body.guildId);

    if (result === "join") {
      return new Response(null, { status: 201 });
    } else if (result === "joined") {
      return new Response(null, { status: 204 });
    } else {
      return errorJson("再度ログインしてください");
    }
  },
);
