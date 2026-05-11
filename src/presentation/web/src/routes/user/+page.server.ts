import { getGuilds } from "$lib/server/oauth2";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const { user } = await e.parent();

  return {
    guilds: await getGuilds(user.id),
  };
};
