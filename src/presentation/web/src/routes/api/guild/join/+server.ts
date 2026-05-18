import { core } from "$lib/server/core";
import { authAndValidateHandler } from "$lib/server/handler";
import { errorJson } from "$lib/server/res";
import { PostBodySchema } from "$lib/shared/types/routes/api/guild/join";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = await authAndValidateHandler(
  PostBodySchema,
  async (e, body) => {
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
