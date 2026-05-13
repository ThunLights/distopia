import { core } from "$lib/server/core";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async (e) => {
  const { guildId } = await e.parent();

  const { meta, guild, record, reviews } = await core.guild.findWithAllRefData(guildId);

  if (!meta || !guild) {
    return error(404);
  }

  return {
    meta,
    guild,
    reviews,
    record,
  };
};
