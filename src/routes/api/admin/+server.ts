import { PUBLIC_OWNER_ID } from "$env/static/public";
import { authorization } from "$lib/server/auth";
import { discord } from "$lib/server/discord";
import { ServerError } from "$lib/server/error";
import { generateErrorJson } from "$lib/server/json";
import { json } from "@sveltejs/kit";

import type { RequestHandler } from "@sveltejs/kit";

export const POST = (async (e) => {
	const auth = await authorization(e);
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTH_ERROR");
	}
	if (auth.data.id === PUBLIC_OWNER_ID || await discord.bot.control.guild.isHonoraryMember(auth.data.id)) {
		return json({
			content: "SUCCESS",
		}, { status: 200 });
	}
	return generateErrorJson("PERMISSIONS_DENIED");
}) satisfies RequestHandler;
