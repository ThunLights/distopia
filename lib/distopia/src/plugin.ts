// Type only -- no runtime code. presentation-verify (an optional service in the
// thunlights/distopia monorepo, see k8s/README.md's "Verify RPC" section) implements
// VerifyService generically by loading a plugin file and delegating to it -- the actual
// anti-bot/fingerprinting logic never has to live in this repo. These two interfaces are
// that plugin file's contract (server-side) and the browser-side script it may optionally
// serve, published here so a plugin can be authored and type-checked anywhere, without
// needing this monorepo at all.

// Everything a plugin method can learn about the real incoming /api/verify request, grouped
// into one extensible object rather than growing parameter lists on every method that might
// want more of it later (e.g. a future geo/ASN lookup needs nothing more than adding a field
// here). `cookie`/`authorization` are stripped from `headers` before this is built (see
// presentation-web's lib/server/verifyPlugin.ts) since nothing downstream has a legitimate
// need for this request's own session credentials.
export type VerifyRequestContext = {
  headers: Record<string, string>;
  // Best-effort client IP as presentation-web resolved it (SvelteKit's
  // event.getClientAddress()) -- null if it couldn't be determined. Whether this is the
  // real client IP or a reverse proxy's depends on how presentation-web's own deployment is
  // configured; validating/trusting it is entirely the plugin's responsibility.
  ip: string | null;
};

export interface VerifyServerPlugin {
  // Extra signal on top of the built-in Turnstile check. Return false to block verification.
  evaluate(input: {
    guildId: string;
    userId: string;
    extra: unknown;
    request: VerifyRequestContext;
  }): Promise<boolean> | boolean;

  // Raw JS source for the optional browser-side VerifyClientPlugin script (below), relayed
  // as-is by presentation-web. Return null/"" for "nothing to serve".
  getClientScript(): Promise<string | null> | string | null;

  // Reverses whatever the client script's own encrypt() produced. Return null on failure
  // (treated like any other invalid body).
  decrypt(encrypted: string, request: VerifyRequestContext): Promise<string | null> | string | null;
}

export interface VerifyClientPlugin {
  // Runs in the browser on the verify page. Whatever is returned is sent to
  // VerifyServerPlugin.evaluate as `extra`, JSON-round-tripped.
  collect(): Promise<unknown> | unknown;

  // Optional: obfuscate/encrypt the JSON body before it's POSTed to /api/verify -- e.g. a
  // private R25A/R25B-style cipher (see thunlights/discord-verify's own
  // src/lib/Crypto/R25A.ts/R25B.ts for the kind of thing this is for). Omit this entirely to
  // send the body as plain JSON. When provided, presentation-web reverses it by calling the
  // same VerifyServerPlugin's decrypt -- encrypt() and decrypt() must agree on the scheme
  // since they're two halves of the one plugin.
  encrypt?(json: string): string;
}

// Named slices of VerifyServerPlugin, one per conventional plugin role (see
// src/presentation/verify/plugins/.fingerprint and .anti-scraping) -- loadPluginFolder itself
// only cares about which methods a plugin file defines, not which named type it was written
// against, so these exist purely to catch an accidental cross-role implementation (e.g. a
// fingerprint-only file defining decrypt) at compile time instead of it silently working.
// A real plugin is free to ignore these and implement Partial<VerifyServerPlugin> directly
// (e.g. to split evaluate and getClientScript across two separate files).

// Device/anti-bot signal: evaluates whatever the matching FingerprintClientPlugin's collect()
// produced, and serves that same browser-side script.
export type FingerprintServerPlugin = Pick<VerifyServerPlugin, "evaluate" | "getClientScript">;
export type FingerprintClientPlugin = Pick<VerifyClientPlugin, "collect">;

// Request-body obfuscation only -- no fingerprinting signal of its own. decrypt() and the
// matching AntiScrapingClientPlugin's encrypt() are two halves of one cipher and must agree.
export type AntiScrapingServerPlugin = Pick<VerifyServerPlugin, "decrypt" | "getClientScript">;
export type AntiScrapingClientPlugin = Pick<VerifyClientPlugin, "collect" | "encrypt">;
