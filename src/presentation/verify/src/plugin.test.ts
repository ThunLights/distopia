import { beforeEach, describe, expect, it } from "vitest";

import { decryptBody, evaluate, getClientScript } from "./plugin";

// No VERIFY_PLUGIN_DIR is set in this test environment, so this falls back to the default
// ../plugins directory -- which only contains the inert, dot-prefixed samples (.fingerprint,
// .anti-scraping), so loadPluginFolder sees an empty folder. Exercises the "no plugin" path
// every real deployment without a mounted plugin file actually takes.
describe("plugin (no plugin loaded)", () => {
  beforeEach(() => {
    delete process.env.VERIFY_PLUGIN_DIR;
  });

  it("evaluate always allows", async () => {
    expect(await evaluate({ guildId: "1", userId: "2", extra: null, headers: {} })).toBe(true);
  });

  it("getClientScript returns empty", async () => {
    expect(await getClientScript()).toBe("");
  });

  it("decryptBody returns null", async () => {
    expect(await decryptBody("anything")).toBeNull();
  });
});
