import { json } from "@sveltejs/kit";
import { z } from "zod";

import { structChecker } from "$lib/struct";
import { authorization } from "$lib/server/auth";
import { ServerError } from "$lib/server/error";
import { discord } from "$lib/server/discord";
import { database } from "$lib/server/Database";

import type { RequestHandler } from "@sveltejs/kit";

import { GuildsUserZod } from "$lib/server/discord";

export const _GuildUser = GuildsUserZod.extend({ joinBot: z.boolean(), tmp: z.boolean() })

export const _RequestZod = z.object({});
export const _ResponseZod = z.object({
    content: z.string().or(_GuildUser.array())
});

export type Request = z.infer<typeof _RequestZod>;
export type Response = z.infer<typeof _ResponseZod>;

export const POST = (async (e) => {
    const body = structChecker(e.request.body, _RequestZod);
    const user = await authorization(e);
    if (!body) {
        return json({
            content: "BODY_PARSE_ERROR"
        } satisfies Response, { status: 400 })
    }
    if (user instanceof ServerError) {
        return json({
            content: user.content,
        } satisfies Response, { status: 400 });
    }
    const guilds = await discord.oauth.guild.guilds.fetch(user.data);
    const tmpGuilds = await database.guildTables.tmp.datas();
    if (!guilds) {
        return json({
            content: "GUILDS_NOT_FOUND"
        } satisfies Response, { status: 400 })
    }
    const response = {
        content: guilds.map(value => { return {...value, ...{ joinBot: discord.bot.guilds.fetchGuild(value.id), tmp: tmpGuilds.map(value => value.guildId).includes(value.id) }} }),
    } satisfies Response;
    return json(response);
}) satisfies RequestHandler;
