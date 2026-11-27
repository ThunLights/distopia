import { CHARACTER_LIMIT } from "app-core/constant";
import { z } from "zod";

export const SEARCH_PAGE_SIZE = 15;

export const PostBodySchema = z.object({
  term: z.string().max(CHARACTER_LIMIT.searchTerm),
  type: z.union([z.literal("normal"), z.literal("nsfw"), z.literal("all")]),
  serverTag: z.boolean().optional(),
  page: z.number().int().min(1).max(10000).default(1),
});

export type PostBody = z.input<typeof PostBodySchema>;

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
  serverTag: string | null;
  serverTagBadgeUrl: string | null;
};

export type ResponseMethodPost = {
  guilds: Guild[];
  time: string;
  count: number;
};
