import { z } from "zod";

import { DiscordBotClient } from "./Discord/index.js";
import { DiscordOauth } from "./Discord/Oauth/index.js";

import { config } from "$lib/server/config";

export const GuildsUserZod = z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string().optional(),
    banner: z.string().optional(),
    owner: z.boolean(),
    permissions: z.string(),
    approximate_member_count: z.number(),
    approximate_presence_count: z.number(),
})

type DiscordConfig = {
    bot: {
        id: string
        token: string
        secret: string
        url: string
    }
    oauth: string
};

type AccessToken2dataResponse = {
    id: string
    username: string
    avatar: string
    global_name: string
    email: string | null
};

type CodeCheckResponse = {
    token_type: string
    access_token: string
    expires_in: number
    refresh_token: string
    scope: string
};

export type GuildsUser = z.infer<typeof GuildsUserZod>

export type Code2dataResponse = CodeCheckResponse & AccessToken2dataResponse;

export class DiscordController {
    public readonly config: DiscordConfig = config;
    public readonly bot = new DiscordBotClient();
    public readonly oauth = new DiscordOauth()
}

export const discord = new DiscordController();
