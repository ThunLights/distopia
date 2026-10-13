import { describe, expect, test } from "vitest";

import { FingerprintSchema, fingerprintHashes } from "./fingerprint";

describe("FingerprintSchema", () => {
  test("accepts a plain JSON-shaped object", () => {
    const result = FingerprintSchema.safeParse({ fingerprintjs: "a", canvas: ["b", 1], gpu: null });
    expect(result.success).toBe(true);
  });

  test("rejects a value that isn't JSON-serializable", () => {
    const result = FingerprintSchema.safeParse(() => {});
    expect(result.success).toBe(false);
  });
});

describe("fingerprintHashes", () => {
  test("returns no hashes for no fingerprint", () => {
    expect(fingerprintHashes(undefined)).toEqual([]);
    expect(fingerprintHashes(null)).toEqual([]);
  });

  test("hashes each top-level signal independently", () => {
    const hashes = fingerprintHashes({ fingerprintjs: "a", canvas: "b", gpu: "c" });
    expect(hashes).toHaveLength(3);
    expect(new Set(hashes).size).toBe(3);
  });

  test("hashes identically regardless of key order", () => {
    const a = fingerprintHashes({ canvas: "x", gpu: "y" });
    const b = fingerprintHashes({ gpu: "y", canvas: "x" });
    expect(new Set(a)).toEqual(new Set(b));
  });

  test("a shared single signal produces one shared hash even when the rest differs", () => {
    const a = fingerprintHashes({ gpu: "same-gpu", canvas: "canvas-a" });
    const b = fingerprintHashes({ gpu: "same-gpu", canvas: "canvas-b" });
    const shared = a.filter((hash) => b.includes(hash));
    expect(shared).toHaveLength(1);
  });

  test("hashes a non-object fingerprint as a single value", () => {
    expect(fingerprintHashes("raw-value")).toHaveLength(1);
  });
});
