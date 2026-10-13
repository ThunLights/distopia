import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadPluginFolder } from "./pluginLoader";

describe("loadPluginFolder", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "verify-plugin-test-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns null for a missing directory", async () => {
    expect(await loadPluginFolder(join(dir, "does-not-exist"))).toBeNull();
  });

  it("returns null when the folder is empty", async () => {
    expect(await loadPluginFolder(dir)).toBeNull();
  });

  it("ignores dot-prefixed files", async () => {
    await writeFile(join(dir, ".fingerprint"), "export default { evaluate: () => false };");
    expect(await loadPluginFolder(dir)).toBeNull();
  });

  it("loads a plugin file and calls its evaluate", async () => {
    await writeFile(
      join(dir, "fingerprint.mjs"),
      "export default { evaluate: (input) => input.userId === 'ok' };",
    );
    const plugin = await loadPluginFolder(dir);
    const input = { guildId: "g", extra: null, headers: {} };
    expect(await plugin!.evaluate({ ...input, userId: "ok" })).toBe(true);
    expect(await plugin!.evaluate({ ...input, userId: "bad" })).toBe(false);
  });

  it("AND-combines evaluate across multiple plugin files", async () => {
    await writeFile(join(dir, "a.mjs"), "export default { evaluate: () => true };");
    await writeFile(join(dir, "b.mjs"), "export default { evaluate: () => false };");
    const plugin = await loadPluginFolder(dir);
    expect(await plugin!.evaluate({ guildId: "g", userId: "u", extra: null, headers: {} })).toBe(
      false,
    );
  });

  it("defaults to allow when no plugin file defines evaluate", async () => {
    await writeFile(join(dir, "a.mjs"), "export default { decryptBody: (s) => s };");
    const plugin = await loadPluginFolder(dir);
    expect(await plugin!.evaluate({ guildId: "g", userId: "u", extra: null, headers: {} })).toBe(
      true,
    );
  });

  it("uses the first (sorted) plugin file that defines decryptBody", async () => {
    await writeFile(join(dir, "a.mjs"), "export default { decryptBody: () => 'from-a' };");
    await writeFile(join(dir, "b.mjs"), "export default { decryptBody: () => 'from-b' };");
    const plugin = await loadPluginFolder(dir);
    expect(await plugin!.decryptBody("x")).toBe("from-a");
  });

  it("obfuscates the client script returned by a plugin file", async () => {
    await writeFile(
      join(dir, "a.mjs"),
      "export default { getClientScript: () => 'const secret = 42;' };",
    );
    const plugin = await loadPluginFolder(dir);
    const script = await plugin!.getClientScript();
    expect(script).not.toBeNull();
    expect(script).not.toContain("const secret = 42;");
  });

  it("computes the client script only once and caches it", async () => {
    await writeFile(
      join(dir, "a.mjs"),
      `let calls = 0; export default { getClientScript: () => { calls++; return "const n = " + calls + ";"; } };`,
    );
    const plugin = await loadPluginFolder(dir);
    const first = await plugin!.getClientScript();
    const second = await plugin!.getClientScript();
    expect(first).toBe(second);
  });

  it("does not cache a rejected getClientScript call, so a later call can retry", async () => {
    await writeFile(
      join(dir, "a.mjs"),
      `let calls = 0; export default { getClientScript: () => { calls++; if (calls === 1) { throw new Error("boom"); } return "const ok = true;"; } };`,
    );
    const plugin = await loadPluginFolder(dir);
    await expect(plugin!.getClientScript()).rejects.toThrow("boom");
    await expect(plugin!.getClientScript()).resolves.toContain("ok");
  });
});
