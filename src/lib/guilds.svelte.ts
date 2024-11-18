import type { Response } from "$lib/api/guilds";

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
