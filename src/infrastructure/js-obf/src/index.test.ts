import { describe, expect, test } from "vitest";

import { obfuscate } from "./index";

describe("obfuscate", () => {
  test("transforms the source so the original isn't readable as-is", () => {
    const result = obfuscate("const secret = 42; console.log(secret);");
    expect(result).not.toContain("const secret = 42;");
  });

  test("produces runnable JS that preserves behavior", () => {
    const result = obfuscate("globalThis.__obfuscateTestValue = 1 + 2;");
    new Function(result)();
    expect((globalThis as { __obfuscateTestValue?: number }).__obfuscateTestValue).toBe(3);
  });
});
