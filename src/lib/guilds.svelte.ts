import type { Response } from "$lib/types/guilds/index";
import type { Response as PublicGuildsResponse } from "$lib/types/guilds/public/index";

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
