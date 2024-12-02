import { database, DatabaseError } from "./Database/index";
import { discord } from "./discord";

import type { Review } from "./Database/Guild/Guild.review";

export type Guild = {
	guildId: string;
	name: string;
	invite: string;
	icon: string | null;
	banner: string | null;
	category: string;
	description: string;
	tags: string[];
	nsfw: boolean;
	level: {
		guildId: string;
		level: number;
		point: number;
	} | null;
	online: number | null
	members: number | null
	boost: number | null
	review: number
	reviews: Review[]
}

export async function id2Guild(guildId: string) {
	const guild = await database.guildTables.guild.id2Data(guildId);
	const level = await database.guildTables.level.data(guildId);
	const tags = await database.guildTables.tag.data(guildId);
	const nsfw = await database.guildTables.nsfw.data(guildId);
	const reviews = await database.guildTables.review.data.guilds(guildId);
	const stars = reviews.map(value => value.star);
	if (guild instanceof DatabaseError || guild === null) {
		return "SERVER_NOT_FOUND";
	}
	return {...guild, ...{
		nsfw,
		tags,
		level: level ? {...level, ...{ level: Number(level.level), point: Number(level.point)}} : level,
		members: await discord.bot.control.guild.memberCount(guildId),
		online: await discord.bot.control.guild.memberCount(guildId, "online"),
		boost: await discord.bot.control.guild.boost(guildId),
		review: stars.length ? stars.reduce((sum, element) => sum + element) / reviews.length : 0,
		reviews,
	}} satisfies Guild;
}
