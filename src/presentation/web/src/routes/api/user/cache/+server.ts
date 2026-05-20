import { core } from "$lib/server/core";
import { authAndValidateHandler } from "$lib/server/handler";
import type { ResponseBodyTypeGuild } from "$lib/shared/types/routes/api/user/cache";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { z } from "zod";

const DeleteBodySchema = z.object({
  type: z.union([z.literal("guild")]),
});

export type DeleteBody = z.infer<typeof DeleteBodySchema>;

export const DELETE: RequestHandler = await authAndValidateHandler(
  DeleteBodySchema,
  async (e, body) => {
    if (body.type === "guild") {
      return json(
        {
          guilds: (await core.oauth2.getGuildsHasOwnerOrAdmin(e.locals.user.id, false)) ?? [],
        } satisfies ResponseBodyTypeGuild,
        { status: 200 },
      );
    }

    return new Response(null, {
      status: 200,
    });
  },
);
