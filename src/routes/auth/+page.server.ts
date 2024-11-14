import { discord } from "$lib/discord";

import type { ServerLoad } from "@sveltejs/kit";

export type PageContent = {
    id: string
    username: string
    token: string
    avatar: string | null
} | null

export type PageData = {
    content: PageContent
}

export const load = (async (e) => {
    const { searchParams } = e.url;
    const code = searchParams.get("code")
    let content: PageContent = null;

    if (code) {
        const data = await discord.codeChecker(code);
        if (!data) {
            return null;
        }
        content = {
            id: data.id,
            username: data.username,
            token: data.token,
            avatar: data.userInfo.avatar ?? null
        };
    }

    return {
        content,
    } satisfies PageData;
}) satisfies ServerLoad;
