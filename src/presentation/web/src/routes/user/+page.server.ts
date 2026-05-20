import { core } from "$lib/server/core";
import type { Guilds } from "$lib/shared/types/routes/api/user/cache";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const { user } = await e.parent();

  return {
    guilds: ((await core.oauth2.getGuilds(user.id, false)) ?? []).map(
      ({
        id,
        name,
        icon,
        banner,
        owner,
        approximate_member_count,
        approximate_presence_count,
        isBotJoined,
        isPublic,
      }) => ({
        id,
        name,
        icon,
        banner,
        owner,
        approximate_member_count,
        approximate_presence_count,
        isBotJoined,
        isPublic,
      }),
    ) satisfies Guilds,
  };
};
