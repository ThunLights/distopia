// Exercises the real Bun.build() call in index.ts's getClientScript() -- the loader always
// skips this dot-prefixed folder in production, so without this test, a TS error in client.ts
// (or a mistake in the bundling call itself) would go unnoticed until someone actually copied
// this to a non-dot name.
import { expect, test } from "bun:test";

import plugin from "./index";

test("getClientScript bundles client.ts to runnable JS", async () => {
  const script = await plugin.getClientScript!();
  expect(typeof script).toBe("string");
  expect(script).toContain("collect");
});
