import { expect, test } from "bun:test";

import plugin from "./index";

test("bundles client.ts and serves a valid wasm module", async () => {
  expect(await plugin.getClientScript()).toContain("collect");
  const { instance } = await WebAssembly.instantiate(plugin.getClientWasm!() as Uint8Array);
  expect((instance.exports as { add(a: number, b: number): number }).add(1, 2)).toBe(3);
});
