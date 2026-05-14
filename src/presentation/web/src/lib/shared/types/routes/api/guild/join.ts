import { z } from "zod";

export const PostBodySchema = z.object({
  guildId: z.string(),
});

export type PostBody = z.infer<typeof PostBodySchema>;
