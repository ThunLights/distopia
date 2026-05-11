import type { Guilds } from "repo-memory/OAuth2Guilds";
import { z } from "zod";

export const deleteBodySchema = z.object({
  type: z.union([z.literal("guild")]),
});

export type DeleteBody = z.infer<typeof deleteBodySchema>;

export type ResponseBodyTypeGuild = {
  guilds: Guilds;
};
