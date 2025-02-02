import { errorHandling } from "$lib/server/error";
import { discord } from "$lib/server/discord";
import { database } from "$lib/server/Database/index";
import { FetchError } from "$lib/server/Discord/Oauth/Oauth.fetch";
import { generateBackUp } from "$lib/server/archive";

import type { Handle, HandleServerError } from "@sveltejs/kit";

process.on("uncaughtExceptionMonitor", errorHandling);

async function updateExpireAccount() {
	const users = await database.user.aboutExpire();
	for (const user of users) {
		const newData = await discord.oauth.fetch.resetAccessToken(user.refreshToken);
		if (newData instanceof FetchError) {
			await database.user.delete(user.id);
			await database.token.delete(user.id);
		} else {
			await database.user.update(user.id, user.username, newData.access_token, newData.refresh_token);
		}
	}
}

async function updateGuildRemove() {
	for (const { guildId } of await database.guildTables.guild.datas()) {
		const guildIds = discord.bot.client.guilds.cache.values().map(guild => guild.id).toArray();
		if (!guildIds.includes(guildId)) {
			await database.guildTables.removed.add(guildId);
		}
	}

	for (const { guildId } of await database.guildTables.removed.fetchExpirationElements()) {
		await database.guildTables.activeRate.remove(guildId);
		await database.guildTables.bump.delete(guildId);
		await database.guildTables.bumpCounter.remove(guildId);
		await database.guildTables.guild.delete(guildId);
		await database.guildTables.level.delete(guildId);
		await database.guildTables.newMember.remove(guildId);
		await database.guildTables.newMessage.remove(guildId);
		await database.guildTables.nsfw.delete(guildId);
		await database.guildTables.removed.remove(guildId);
		await database.guildTables.review.delete.guilds(guildId);

		await database.guildTables.settings.bump.remove(guildId);
		await database.guildTables.settings.bumpNoticeRole.delete(guildId);
		await database.guildTables.settings.dangerousPeople.ban.remove(guildId);
		await database.guildTables.settings.dangerousPeople.notice.remove(guildId);
		await database.guildTables.settings.owner.delete(guildId);

		await database.guildTables.tag.delete(guildId);
		await database.guildTables.tmp.delete(guildId);
		await database.guildTables.vcMemberSum.remove(guildId);
		await database.guildTables.vcMemberUpperTwo.remove(guildId);
		await database.guildTables.tmp.delete(guildId);

		await database.archives.level.ranking.remove(guildId);
		await database.archives.activeRate.max.remove(guildId);
		await database.archives.activeRate.ranking.remove(guildId);
	}
}

async function start() {
	await discord.bot.setEvents();
	await discord.bot.login();

	setInterval(async () => {
		await updateExpireAccount();
		await updateGuildRemove();
	}, 5 * 60 * 1000);
	setInterval(async () => {
		await discord.bot.update();
		await generateBackUp();
	}, 20 * 60 * 1000);
}

export const handle = (async ({event, resolve}) => {
	const response = await resolve(event);
	response.headers.set("Cache-Control", "no-store");
	response.headers.set("Pragma", "no-cache");
	return response;
}) satisfies Handle;

export const handleError = (async (input) => {
    if (input.status === 404) {
        return;
    };
	if (input.status === 405) {
		return;
	};
	errorHandling(input);
}) satisfies HandleServerError;

await start();
