// Sample/template only -- the browser-side half of this plugin, bundled to plain JS by
// index.ts's getClientScript(). init() receives the server plugin's getClientWasm() bytes.
import type { VerifyClientPlugin } from "distopia";

let wasm: { add(a: number, b: number): number } | null = null;

const plugin: VerifyClientPlugin = {
  async init(bytes) {
    if (bytes) {
      const { instance } = await WebAssembly.instantiate(bytes);
      wasm = instance.exports as typeof wasm;
    }
  },

  collect() {
    // TODO: do the real signal gathering/hashing inside wasm; add() is just a placeholder.
    return wasm?.add(1, 2) ?? null;
  },
};

export default plugin;
