import { core } from "$lib/server/core";
import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async (e) => {
  const guildId = e.params.id;

  const { guild, record, meta } = await core.guild.findWithRecord(guildId);

  if (!meta) {
    return redirect(302, "/user");
  }

  return {
    guildId,
    meta: {
      ...meta,
      avatarUrl: meta.icon ? core.guild.iconUrl(guildId, meta.icon) : null,
    },
    guild,
    record,
  };
};
