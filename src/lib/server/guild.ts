import { database, DatabaseError } from "./Database/index";
import { discord } from "./discord";
import { parseRanking } from "./ranking";

export type Review = {
	guildId: string;
	userId: string;
	star: number;
	content?: string | null;
	user: {
		username: string;
		avatar: string | null;
	};
};

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
	activeRate: number | null;
	online: number | null;
	members: number | null;
	boost: number | null;
	review: number;
	reviews: Review[];
	ranking: {
		level: number | null;
		activeRate: number | null;
	};
	level: {
		guildId: string;
		level: number;
		point: number;
	} | null;
	archives: {
		level: {
			ranking: number;
		};
		activeRate: {
			max: number;
			ranking: number;
		};
	};
};

async function getArchives(guildId: string) {
	const activeRateMax = await database.archives.activeRate.max.data(guildId);
	const activeRateRanking = await database.archives.activeRate.ranking.data(guildId);
	const levelRanking = await database.archives.level.ranking.data(guildId);
	return {
		level: {
			ranking: levelRanking ? Number(levelRanking.content) : 0
		},
		activeRate: {
			max: activeRateMax ? Number(activeRateMax.content) : 0,
			ranking: activeRateRanking ? Number(activeRateRanking.content) : 0
		}
	};
}

export async function id2Guild(guildId: string) {
	const guild = await database.guildTables.guild.id2Data(guildId);
	const activeRate = await database.guildTables.activeRate.data(guildId);
	const level = await database.guildTables.level.data(guildId);
	const tags = await database.guildTables.tag.data(guildId);
	const nsfw = await database.guildTables.nsfw.data(guildId);
	const baserReviews = await database.guildTables.review.data.guilds(guildId);
	const archives = await getArchives(guildId);
	const stars = baserReviews.map((value) => value.star);
	const reviews: Review[] = [];
	if (guild instanceof DatabaseError || guild === null) {
		return "SERVER_NOT_FOUND";
	}
	for (const review of baserReviews) {
		const user = await database.user.data(review.userId);
		if (user) {
			reviews.push({
				...review,
				...{
					user: {
						username: user.username,
						avatar: user.avatar
					}
				}
			});
		}
	}
	return {
		...guild,
		...{
			nsfw,
			tags,
			ranking: {
				level: parseRanking(
					guildId,
					(await database.guildTables.level.ranking()).map((value) => {
						return {
							guildId: value.guildId,
							content: value.level
						};
					})
				),
				activeRate: parseRanking(guildId, await database.guildTables.activeRate.ranking())
			},
			activeRate: activeRate ? Number(activeRate.content) : activeRate,
			level: level
				? { ...level, ...{ level: Number(level.level), point: Number(level.point) } }
				: level,
			members: await discord.bot.control.guild.memberCount(guildId),
			online: await discord.bot.control.guild.memberCount(guildId, "online"),
			boost: await discord.bot.control.guild.boost(guildId),
			review: stars.length ? stars.reduce((sum, element) => sum + element) / reviews.length : 0,
			reviews,
			archives
		}
	} satisfies Guild;
}
