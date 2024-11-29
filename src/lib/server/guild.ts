import { database, DatabaseError } from "./Database/index";
import { discord } from "./discord";

import type { Response } from "$routes/api/guilds/public/[id]/+server";

export async function id2Guild(guildId: string) {
	const guild = await database.guildTables.guild.id2Data(guildId);
	const level = await database.guildTables.level.data(guildId);
	const tags = await database.guildTables.tag.data(guildId);
	const nsfw = await database.guildTables.nsfw.data(guildId);
	if (guild instanceof DatabaseError || guild === null) {
		return "SERVER_NOT_FOUND";
	}
	return {...guild, ...{
		nsfw,
		tags,
		level,
		members: await discord.bot.control.guild.memberCount(guildId),
		online: await discord.bot.control.guild.memberCount(guildId, "online"),
		boost: await discord.bot.control.guild.boost(guildId),
	}} satisfies Response;
}
