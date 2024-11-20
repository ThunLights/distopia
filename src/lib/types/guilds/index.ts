import { z } from "zod";

import { GuildsUserZod } from "$lib/server/discord";

export const GuildUser = GuildsUserZod.extend({ joinBot: z.boolean() })

export const _RequestZod = z.object({});
export const _ResponseZod = z.object({
    content: z.string().or(GuildUser.array())
});

export type Request = z.infer<typeof _RequestZod>;
export type Response = z.infer<typeof _ResponseZod>;
