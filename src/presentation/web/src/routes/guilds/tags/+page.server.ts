import { getTaggedGuilds } from "#lib/server/taggedGuilds.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return { guilds: await getTaggedGuilds() };
};
