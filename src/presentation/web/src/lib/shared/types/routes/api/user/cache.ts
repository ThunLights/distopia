import { z } from "zod";

export type Guilds = {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  owner: boolean;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  isBotJoined: boolean;
  isPublic: boolean;
}[];

export const deleteBodySchema = z.object({
  type: z.union([z.literal("guild")]),
});

export type DeleteBody = z.infer<typeof deleteBodySchema>;

export type ResponseBodyTypeGuild = {
  guilds: Guilds;
};
