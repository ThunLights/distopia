import { core } from "$lib/server/core";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const { user } = await e.parent();

  return {
    guilds: (await core.oauth2.getGuilds(user.id, false)) ?? [],
  };
};
