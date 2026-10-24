// Set by lib/client/verify.ts only when a loaded VerifyClientPlugin actually provided its
// own encrypt() -- tells routes/api/verify/+server.ts to have presentation-verify reverse it
// (via the plugin's decrypt()) instead of parsing the body as plain JSON. Absent entirely when
// no plugin is loaded (the common case), so the plain-JSON path never has to think about it.
export const ENCRYPTED_BODY_HEADER = "X-Verify-Body-Encoding";
export const ENCRYPTED_BODY_VALUE = "plugin";

// The request body shape. It is validated by presentation-verify (src/submit.ts's
// PostBodySchema), not here -- this server only relays the raw text.
export type PostBody = {
  guildId: string;
  turnstileToken: string;
  extra?: unknown;
};
