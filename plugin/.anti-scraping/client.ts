// Sample/template only -- the browser-side half of this plugin. index.ts's getClientScript()
// bundles this file to plain JS (via Bun.build, target: "browser") before it's ever served,
// so write this in TS freely -- the browser only ever receives the bundled output, never this
// file directly.
import type { AntiScrapingClientPlugin } from "distopia";

const plugin: AntiScrapingClientPlugin = {
  // This role is about body obfuscation, not device signal -- collect() is still required
  // by the contract (the loaded client plugin always calls it), but it has nothing of its
  // own to report. A ".fingerprint" plugin active alongside this one covers that signal.
  collect() {
    return null;
  },

  // TODO (optional): obfuscate/encrypt the JSON body before it's POSTed -- must agree with
  // this plugin's own decrypt() in index.ts.
  // encrypt(json) {
  //   return json;
  // },
};

export default plugin;
