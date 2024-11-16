import { z } from "zod";

export const _ResponseContentZod = z.object({
    id: z.string(),
    username: z.string(),
    email: z.string().nullable(),
    avatar: z.string().nullable(),
});
export const _ResponseZod = z.object({
    content: z.string().or(_ResponseContentZod)
});

export type ResponseContent = z.infer<typeof _ResponseContentZod>;
export type Response = z.infer<typeof _ResponseZod>;
