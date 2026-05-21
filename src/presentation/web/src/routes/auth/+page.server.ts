import { getAndVerifyOAuthState, redirectToDiscordOAuth, setToken } from "$lib/server/auth";
import { core } from "$lib/server/core";
import { jwt } from "$lib/server/jwt";
import type { UserAuth } from "$lib/shared/types/UserAuth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const code = e.url.searchParams.get("code");
  const state = e.url.searchParams.get("state");
  let user: UserAuth | null = null;

  if (code) {
    // Validate state parameter to prevent CSRF
    if (!getAndVerifyOAuthState(e.cookies, state)) {
      return { user: null, error: "Invalid OAuth state. Please try logging in again." };
    }

    const apiResult = await core.oauth2.codeToUser(code);

    if (apiResult) {
      const { id, username, avatarUrl } = apiResult;
      const token = await jwt.sign({ userId: id });

      if (token) {
        await setToken(e.cookies, token);
        user = {
          id,
          username,
          avatarUrl: avatarUrl ?? undefined,
        };
      }
    }
  } else {
    // No code present — initiate OAuth flow with state parameter
    redirectToDiscordOAuth(e.cookies);
  }

  return { user };
};
