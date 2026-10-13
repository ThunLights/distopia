import { z } from "zod";

// Set by lib/client/verify.ts only when a loaded VerifyClientPlugin actually provided its
// own encrypt() -- tells routes/api/verify/+server.ts to reverse it via
// VerifyService.Decrypt instead of parsing the body as plain JSON. Absent entirely when
// no plugin is loaded (the common case), so the plain-JSON path never has to think about it.
export const ENCRYPTED_BODY_HEADER = "X-Verify-Body-Encoding";
export const ENCRYPTED_BODY_VALUE = "plugin";

export const PostBodySchema = z.object({
  guildId: z.string().regex(/^\d+$/),
  turnstileToken: z.string().min(1),
  extra: z.unknown().optional(),
});

export type PostBody = z.infer<typeof PostBodySchema>;
