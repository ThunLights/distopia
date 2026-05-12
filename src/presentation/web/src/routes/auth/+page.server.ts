import { setToken } from "$lib/server/auth";
import { core } from "$lib/server/core";
import { jwt } from "$lib/server/jwt";
import type { UserAuth } from "$lib/shared/types/UserAuth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const code = e.url.searchParams.get("code");
  let user: UserAuth | null = null;

  if (code) {
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
          token,
        };
      }
    }
  }

  return { user };
};
