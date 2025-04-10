import { json } from "@sveltejs/kit";
import { database } from "$lib/server/Database/index";
import { discord } from "$lib/server/discord";

import type { RequestHandler } from "@sveltejs/kit";

export type ResponseJson = {
	post: {
		content: {
			guildId: string;
			eventId: string;
			name: string;
			description: string;
			guild: {
				name: string;
			};
		}[];
	};
};

export const POST = (async () => {
	const result: ResponseJson["post"]["content"] = [];

	for (const { guildId, eventId } of await database.eventBoost.findMany()) {
		const data = await discord.bot.control.guild.fetchEvent(guildId, eventId);
		if (data && data.guild) {
			const { name, description, guild } = data;
			result.push({
				guildId,
				eventId,
				name,
				description: description ?? "",
				guild: {
					name: guild.name
				}
			});
		}
	}

	return json(
		{
			content: result
		} satisfies ResponseJson["post"],
		{ status: 200 }
	);
}) satisfies RequestHandler;
