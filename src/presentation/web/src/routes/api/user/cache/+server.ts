import { authAndValidateHandler } from "$lib/server/handler";
import { getGuilds } from "$lib/server/oauth2";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { z } from "zod";

export const DELETE: RequestHandler = await authAndValidateHandler(
  z.object({
    type: z.union([z.literal("guild")]),
  }),
  async (e, body) => {
    if (body.type === "guild") {
      return json(
        {
          guilds: await getGuilds(e.locals.user.id, true),
        },
        { status: 200 },
      );
    }

    return new Response(null, {
      status: 200,
    });
  },
);
