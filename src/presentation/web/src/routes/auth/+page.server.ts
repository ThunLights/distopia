import { core } from "$lib/server/core";
import { jwt } from "$lib/server/jwt";
import type { UserAuth } from "$lib/shared/types/UserAuth";
import type { PageServerLoad } from "./$types";

const twoMonth = 2 * 30 * 24 * 60 * 60 * 1000;

export const load: PageServerLoad = async (e) => {
  const code = e.url.searchParams.get("code");
  let user: UserAuth | null = null;

  if (code) {
    const apiResult = await core.oauth2.codeToUser(code);

    if (apiResult) {
      const { id, username, avatarUrl } = apiResult;
      const token = await jwt.sign({ userId: id });

      if (token) {
        e.cookies.set("authorization", token, {
          path: "/",
          expires: new Date(Date.now() + twoMonth),
        });
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
