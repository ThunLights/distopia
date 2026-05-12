import { core } from "$lib/server/core";
import { authHandler } from "$lib/server/handler";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = await authHandler(async (e) => {
  const { user } = e.locals;

  await core.jwt.updateNewUserVerifyKey(user.id);

  return new Response(null, { status: 200 });
});
