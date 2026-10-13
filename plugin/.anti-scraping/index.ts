// Sample/template only -- the leading dot means a dot-prefix-skipping plugin loader (e.g.
// infra-verify's loadPluginFolder, src/infrastructure/verify/src/pluginLoader.ts) always
// skips this folder. Copy it to a non-dot name and implement it for real to activate it. No
// real logic here by design. This is the "anti-scraping" role (request-body obfuscation
// only, no fingerprint signal of its own) -- see distopia's AntiScrapingServerPlugin for
// exactly this slice of the full VerifyServerPlugin contract (the ".fingerprint" sample is
// the other role: device/anti-bot signal + evaluation).
import { join } from "node:path";

import type { AntiScrapingServerPlugin } from "distopia";

// Bundling client.ts is a one-time cost per process, not per request -- reused the same way
// infra-verify's loadPluginFolder caches getClientScript()'s own result on top of this.
let cachedClientScript: Promise<string> | undefined;

const plugin: AntiScrapingServerPlugin = {
  decrypt(_encrypted, _request) {
    // TODO: reverse whatever your client-side VerifyClientPlugin.encrypt() produced -- e.g.
    // a private R25A/R25B-style cipher (see thunlights/discord-verify's own
    // src/lib/Crypto/R25A.ts/R25B.ts for the kind of thing this is for). _request (headers/
    // ip) is available too, e.g. for IP-based rate limiting ahead of attempting to decrypt.
    // Return null on failure.
    return null;
  },

  getClientScript() {
    // Bundles client.ts (TS -> plain JS, since the browser can't run TypeScript syntax) --
    // the loader (infra-verify's loadPluginFolder) separately caches and obfuscates whatever
    // this returns, so this only needs to worry about the TS -> JS step, not caching twice or
    // obfuscating.
    cachedClientScript ??= Bun.build({
      entrypoints: [join(import.meta.dirname, "client.ts")],
      target: "browser",
    }).then((result) => result.outputs[0]!.text());
    return cachedClientScript;
  },
};

export default plugin;
