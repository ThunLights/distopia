import { core } from "$lib/server/core";
import { PUBLIC_OAUTH_URL } from "$lib/shared/constant";
import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async (e) => {
  const { sessionId, sessionKey } = await core.oauth2.savePKCE();

  e.cookies.set("session_key", sessionKey, {
    path: "/",
    expires: new Date(Date.now() + 20 * 60 * 1000),
  });

  return redirect(302, PUBLIC_OAUTH_URL + `state=${encodeURIComponent(sessionId)}`);
};
