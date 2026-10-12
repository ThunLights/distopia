// Sample/template only -- the browser-side half of this plugin. index.ts's getClientScript()
// bundles this file to plain JS (via Bun.build, target: "browser") before it's ever served,
// so write this in TS freely -- the browser only ever receives the bundled output, never this
// file directly.
import type { VerifyClientPlugin } from "distopia";

const plugin: VerifyClientPlugin = {
  collect() {
    // TODO: gather whatever anti-scraping signal this plugin cares about (timing, DOM
    // interaction, canvas/WebGL fingerprint, ...) and return it as JSON-serializable data.
    return null;
  },

  // TODO (optional): obfuscate/encrypt the JSON body before it's POSTed -- must agree with
  // this plugin's own decryptBody() in index.ts.
  // encrypt(json) {
  //   return json;
  // },
};

export default plugin;
