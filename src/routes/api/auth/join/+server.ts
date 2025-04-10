import { json } from "@sveltejs/kit";
import { z } from "zod";

import { authorization } from "$lib/server/auth";
import { errorHandling, ServerError } from "$lib/server/error";
import { generateErrorJson } from "$lib/server/json";
import { structChecker } from "$lib/struct";
import { discord } from "$lib/server/discord";
import { cache } from "$lib/server/Cache/index";

import type { RequestHandler } from "@sveltejs/kit";
import type { UserElement } from "$lib/server/Database/Database.user";

export const _RequestZod = z.object({
	guildId: z.string()
});

export type Request = z.infer<typeof _RequestZod>;

export type Response = {
	content: "entry" | "joined" | "error";
};

async function join(body: Request, id: string, data: UserElement) {
	try {
		const cacheData = await cache.discord.guildsJoin.checkCache(id);
		if (cacheData) {
			return cacheData.status;
		}
		const result = await discord.oauth.guild.join.exec(body.guildId, id, data);
		if (!result) {
			return generateErrorJson("DISCORD_API_ERROR");
		}
		await cache.discord.guildsJoin.insert(id, {
			status: result.status
		});
		return result.status;
	} catch (error) {
		errorHandling(error);
		return generateErrorJson("DISCORD_API_ERROR");
	}
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
	const result = await join(body, auth.data.id, auth.data);
	if (result instanceof globalThis.Response) {
		return result;
	}
	let content =
		result === 201 //201 新しく入った
			? "entry"
			: result === 204 //204 既に入ってる
				? "joined"
				: "error"; //それ以外 無理
	return json(
		{
			content
		},
		{ status: 200 }
	);
}) satisfies RequestHandler;
