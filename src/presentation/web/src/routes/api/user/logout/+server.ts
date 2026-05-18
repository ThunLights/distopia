import { deleteToken } from "$lib/server/auth";
import { authHandler } from "$lib/server/handler";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = await authHandler(async (e) => {
  await deleteToken(e.cookies);

  return new Response(null, { status: 200 });
});
