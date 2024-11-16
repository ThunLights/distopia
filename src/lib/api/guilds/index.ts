import { z } from "zod";

export const _RequestZod = z.object({});
export const _ResponseZod = z.object({
    content: z.string().or(z.object({
    }))
});

export type Request = z.infer<typeof _RequestZod>;
export type Response = z.infer<typeof _ResponseZod>;
