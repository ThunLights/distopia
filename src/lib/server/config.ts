import { BOT_ID, BOT_TOKEN, BOT_SECRET, BOT_REDIRECT_URL } from "$env/static/private";
import { PUBLIC_OAUTH_URL, PUBLIC_OWNER_ID } from "$env/static/public";

export type BotConfig = {
    bot: {
        id: string
        token: string
        secret: string
        url: string
    },
    oauth: string
    owner: string
}

export const config: BotConfig = {
	bot: {
		id: BOT_ID,
		token: BOT_TOKEN,
		secret: BOT_SECRET,
		url: BOT_REDIRECT_URL,
	},
	oauth: PUBLIC_OAUTH_URL,
	owner: PUBLIC_OWNER_ID,
};
