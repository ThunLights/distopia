// Sample/template only -- the leading dot means a dot-prefix-skipping plugin loader (e.g.
// infra-verify's loadPluginFolder, src/infrastructure/verify/src/pluginLoader.ts) always
// skips this folder. Copy it to a non-dot name and implement it for real to activate it. No
// real logic here by design -- see distopia's VerifyServerPlugin for the full contract this
// (partially) implements.
import { join } from "node:path";

import type { VerifyServerPlugin } from "distopia";

// Bundling client.ts is a one-time cost per process, not per request -- reused the same way
// infra-verify's loadPluginFolder caches getClientScript()'s own result on top of this.
let cachedClientScript: Promise<string> | undefined;

const plugin: Partial<VerifyServerPlugin> = {
  evaluate(_input) {
    // TODO: inspect _input.extra (whatever your client-side VerifyClientPlugin.collect()
    // produced) and _input.headers, and return false to block verification.
    return true;
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
