import type { Response as AccountGuilds } from "$routes/api/auth/owner/+server";
import type { Response as TmpGuildResponse } from "$routes/api/guilds/tmp/[id]/+server";
import type { Response as PublicGuildResponse } from "$routes/api/guilds/public/[id]/+server";

export class GuildsApiError {
	constructor(public code: string) {}
}

export async function getAccountGuilds(token: string) {
	try {
		const response = await fetch("/api/auth/owner", {
			method: "POST",
			headers: {
				Authorization: token
			}
		});
		if (response.ok) {
			const data: AccountGuilds = await response.json();
			return data;
		}
		return new GuildsApiError(`API_STATUS_${response.status}`);
	} catch (error) {
		return new GuildsApiError("ERR");
	}
}

export async function getTmpGuild(token: string, guildId: string) {
	try {
		const response = await fetch(`/api/guilds/tmp/${guildId}`, {
			method: "POST",
			headers: {
				Authorization: token
			}
		});
		if (response.ok) {
			const data: TmpGuildResponse = await response.json();
			return data.content;
		}
		return new GuildsApiError(`API_STATUS_${response.status}`);
	} catch (error) {
		console.log(error);
		return new GuildsApiError("ERR");
	}
}

export async function getPublicGuild(token: string, guildId: string) {
	try {
		const response = await fetch(`/api/guilds/public/${guildId}`, {
			method: "POST",
			headers: {
				Authorization: token
			}
		});
		if (response.ok) {
			const data: PublicGuildResponse = await response.json();
			return data;
		}
		return new GuildsApiError(`API_STATUS_${response.status}`);
	} catch (error) {
		return new GuildsApiError("");
	}
}
