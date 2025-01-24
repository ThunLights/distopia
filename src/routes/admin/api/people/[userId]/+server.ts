import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { json } from "@sveltejs/kit";
import { generateErrorJson } from "$lib/server/json";
import { PUBLIC_OWNER_ID } from "$env/static/public";
import { database } from "$lib/server/Database/index";
import { discord } from "$lib/server/discord";

import type { RequestHandler } from "@sveltejs/kit";

export const DELETE = (async (e) => {
	const userId = e.params.userId;
	const auth = await authorization(e);

	if (!userId) {
		return generateErrorJson("USERID_NOT_FOUND");
	}
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTHORIZATION_ERROR");
	}

	if (auth.data.id === PUBLIC_OWNER_ID || await discord.bot.control.guild.isHonoraryMember(auth.data.id)) {
		await database.dangerousPeople.score.delete(userId);
		await database.dangerousPeople.tag.delete(userId);
		await database.dangerousPeople.subAccount.delete(userId);
		const result = await database.dangerousPeople.delete(userId);
		if (!result) {
			return generateErrorJson("DATABASE_ERROR");
		}

		return json({
			content: "success"
		}, { status: 200 });
	}

	return generateErrorJson("PERMISSION_DENIED");
}) satisfies RequestHandler;
