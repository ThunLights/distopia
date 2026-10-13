// Sample/template only -- the browser-side half of this plugin. index.ts's getClientScript()
// bundles this file to plain JS (via Bun.build, target: "browser") before it's ever served,
// so write this in TS freely -- the browser only ever receives the bundled output, never this
// file directly.
import type { FingerprintClientPlugin } from "distopia";

const plugin: FingerprintClientPlugin = {
  collect() {
    // TODO: gather whatever anti-bot/fingerprint signal this plugin cares about (timing, DOM
    // interaction, canvas/WebGL fingerprint, ...) and return it as JSON-serializable data.
    return null;
  },
};

export default plugin;
