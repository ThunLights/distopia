import { z } from "zod";

export const PostBodySchema = z.object({
  guildId: z.string().regex(/^\d+$/),
});

export type PostBody = z.infer<typeof PostBodySchema>;
