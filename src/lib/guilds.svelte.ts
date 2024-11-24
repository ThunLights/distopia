import type { Response } from "$routes/api/guilds/+server";
import type { Response as PublicGuildsResponse } from "$routes/api/guilds/public/+server";
import type { Response as TmpGuildsResponse} from "$routes/api/guilds/tmp/+server";
import type { Response as TmpGuildResponse} from "$routes/api/guilds/tmp/[id]/+server";

export class GuildsApiError {
    constructor(public code: string) {}
}

export async function getGuilds(token: string) {
    try {
        const response = await fetch(`/api/guilds`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        })
        if (response.ok) {
            const data: Response = await response.json();
            if (Array.isArray(data.content)) {
                return data.content
            } else {
                return new GuildsApiError(data.content);
            }
        }
        return new GuildsApiError(`API_STATUS_${response.status}`);
    } catch (error) {
        console.log(error)
        return new GuildsApiError("ERR");
    }
}

export async function getTmpGuild(token: string, guildId: string) {
	try {
		const response = await fetch(`/api/guilds/tmp/${guildId}`, {
			method: "POST",
			headers: {
				Authorization: token,
			}
		});
		if (response.ok) {
			const data: TmpGuildResponse = await response.json();
			return data.content;
		}
		return new GuildsApiError(`API_STATUS_${response.status}`)
	} catch (error) {
		console.log(error);
		return new GuildsApiError("ERR");
	}
}

export async function getTmpGuilds(token: string) {
	try {
		const response = await fetch(`/api/guilds/tmp`, {
			method: "POST",
			headers: {
				Authorization: token,
			}
		});
		if (response.ok) {
			const data: TmpGuildsResponse = await response.json();
			return data.content;
		}
		return new GuildsApiError(`API_STATUS_${response.status}`)
	} catch (error) {
		console.log(error);
		return new GuildsApiError("ERR");
	}
}

export async function getPublicGuilds(token: string) {
    try {
        const response = await fetch("/api/guilds/public", {
            method: "POST",
            headers: {
                Authorization: token,
            },
        });
        if (response.ok) {
            const data: PublicGuildsResponse = await response.json();
            if (Array.isArray(data.content)) {
                return data.content;
            } else {
                return new GuildsApiError(data.content);
            }
        }
        return new GuildsApiError(`API_STATUS_${response.status}`);
    } catch (error) {
        console.log(error);
        return new GuildsApiError("ERR");
    }
}
