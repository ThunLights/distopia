import cfg from "../../../important/discord.json";

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

export const config: BotConfig = cfg;
