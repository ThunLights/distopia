import { core } from "$lib/server/core";
import { fetchVerifyClientScript } from "$lib/server/verifyPlugin";
import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { randomBytes } from "node:crypto";

export const load: PageServerLoad = async (e) => {
  const guildId = e.params.guildId;
  const setting = await core.verify.getSetting(guildId);

  if (!setting?.enabled || !setting.roleId) {
    return error(404, { message: "Verification is not enabled for this server" });
  }

  const { user } = e.locals;
  if (!user) {
    return redirect(302, `/login?redirect=${encodeURIComponent(`/verify/${guildId}`)}`);
  }

  const guilds = await core.oauth2.getGuilds(user.id);
  if (!guilds?.some((guild) => guild.id === guildId)) {
    return error(403, { message: "You are not a member of this server" });
  }

  const meta = await core.guild.fetchMetaData(guildId);

  return {
    guildId,
    guildName: meta?.name ?? guildId,
    iconUrl: meta?.iconUrl,
    clientPlugin: await fetchVerifyClientScript().then(
      (bundle) =>
        bundle && { name: randomBytes(6).toString("base64url"), hasWasm: bundle.wasm !== null },
    ),
  };
};
