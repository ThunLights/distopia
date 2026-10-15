// Sample/template only -- the leading dot means a dot-prefix-skipping plugin loader (e.g.
// infra-verify's loadPluginFolder) always skips this folder. Copy it to a non-dot name to
// activate it. This is the "wasm" role: the browser script (client.ts) gets a WebAssembly
// binary via VerifyClientPlugin.init(), inlined into the SSR'd verify page next to the script.
import { join } from "node:path";

import type { VerifyServerPlugin } from "distopia";

// Minimal module exporting `add(i32, i32) -> i32`. Replace with your own binary, e.g.
// `new Uint8Array(await Bun.file(join(import.meta.dirname, "plugin.wasm")).arrayBuffer())`.
const WASM = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01,
  0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00, 0x0a, 0x09,
  0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b,
]);

let cachedClientScript: Promise<string> | undefined;

const plugin: Pick<VerifyServerPlugin, "evaluate" | "getClientScript" | "getClientWasm"> = {
  evaluate(_input) {
    // TODO: inspect _input.extra (what client.ts's collect() returned) and return false to block.
    return true;
  },

  getClientScript() {
    cachedClientScript ??= Bun.build({
      entrypoints: [join(import.meta.dirname, "client.ts")],
      target: "browser",
    }).then((result) => result.outputs[0]!.text());
    return cachedClientScript;
  },

  getClientWasm() {
    return WASM;
  },
};

export default plugin;
