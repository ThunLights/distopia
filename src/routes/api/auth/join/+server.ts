import { json } from "@sveltejs/kit";
import { z } from "zod";

import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { generateErrorJson } from "$lib/server/json";
import { structChecker } from "$lib/struct";
import { discord } from "$lib/server/discord";

import type { RequestHandler } from "@sveltejs/kit";

export const _RequestZod = z.object({
	guildId: z.string(),
});

export type Request = z.infer<typeof _RequestZod>;

export type Response = {
    content: "entry" | "joined" | "error";
}

export const POST = (async (e) => {
	const auth = await authorization(e);
	const body = structChecker(await e.request.json(), _RequestZod);
	if (auth instanceof ServerError) {
		return generateErrorJson("AUTH_ERROR");
	}
	if (!body) {
		return generateErrorJson("BODY_FORMAT_ERROR");
	}
	const result = await discord.oauth.guild.join.fetch(body.guildId, auth.data.id, auth.data);
	if (!result) {
		return generateErrorJson("DISCORD_API_ERROR");
	}
	//201 新しく入った
	//204 既に入ってる
	//それ以外 無理
	let content = result.status === 201
        ? "entry"
        : result.status === 204
            ? "joined"
            : "error";
	return json({
		content
	}, { status: 200 })
}) satisfies RequestHandler;
