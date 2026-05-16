import { CHARACTER_LIMIT } from "app-core/constant";
import { z } from "zod";

export const PostBodySchema = z.object({
  term: z.string().max(CHARACTER_LIMIT.searchTerm),
  type: z.union([z.literal("normal"), z.literal("nsfw"), z.literal("all")]),
});

export type PostBody = z.infer<typeof PostBodySchema>;

export type Guild = {
  guildId: string;
  name: string;
  invite: string;
  description: string | null;
  tags: string[];
  nsfw: boolean;
  boostCount: number;
  iconUrl: string | null;
  rank: number | null;
};

export type ResponseMethodPost = {
  guilds: Guild[];
  time: string;
  count: number;
};
