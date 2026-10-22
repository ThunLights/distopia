import { deleteToken } from "#lib/server/auth.js";
import { authHandler } from "#lib/server/handler.js";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = await authHandler(async (e) => {
  await deleteToken(e.cookies);

  return new Response(null, { status: 200 });
});
