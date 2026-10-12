// Type only -- no runtime code. presentation-verify (an optional service in the
// thunlights/distopia monorepo, see k8s/README.md's "Verify RPC" section) implements
// VerifyService generically by loading a plugin file and delegating to it -- the actual
// anti-bot/fingerprinting logic never has to live in this repo. These two interfaces are
// that plugin file's contract (server-side) and the browser-side script it may optionally
// serve, published here so a plugin can be authored and type-checked anywhere, without
// needing this monorepo at all.

export interface VerifyServerPlugin {
  // Extra signal on top of the built-in Turnstile check. Return false to block
  // verification. `headers` is the real incoming /api/verify request's headers (minus
  // cookie/authorization -- see presentation-web's lib/server/verifyPlugin.ts).
  evaluate(input: {
    guildId: string;
    userId: string;
    extra: unknown;
    headers: Record<string, string>;
  }): Promise<boolean> | boolean;

  // Raw JS source for the optional browser-side VerifyClientPlugin script (below), relayed
  // as-is by presentation-web. Return null/"" for "nothing to serve".
  getClientScript(): Promise<string | null> | string | null;

  // Reverses whatever the client script's own encrypt() produced. Return null on failure
  // (treated like any other invalid body).
  decryptBody(encrypted: string): Promise<string | null> | string | null;
}

export interface VerifyClientPlugin {
  // Runs in the browser on the verify page. Whatever is returned is sent to
  // VerifyServerPlugin.evaluate as `extra`, JSON-round-tripped.
  collect(): Promise<unknown> | unknown;

  // Optional: obfuscate/encrypt the JSON body before it's POSTed to /api/verify -- e.g. a
  // private R25A/R25B-style cipher (see thunlights/discord-verify's own
  // src/lib/Crypto/R25A.ts/R25B.ts for the kind of thing this is for). Omit this entirely to
  // send the body as plain JSON. When provided, presentation-web reverses it by calling the
  // same VerifyServerPlugin's decryptBody -- encrypt() and decryptBody() must agree on the
  // scheme since they're two halves of the one plugin.
  encrypt?(json: string): string;
}
