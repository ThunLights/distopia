import { afterEach, describe, expect, test, vi } from "vitest";

import { randomNumber, randomNumberSync, randomString, randomStringSync } from "./random";

const DEFAULT_ALPHA = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("randomStringSync", () => {
  test("output length equals n", () => {
    expect(randomStringSync(0)).toHaveLength(0);
    expect(randomStringSync(1)).toHaveLength(1);
    expect(randomStringSync(10)).toHaveLength(10);
    expect(randomStringSync(64)).toHaveLength(64);
  });

  test("all output characters come from the default alphabet", () => {
    const result = randomStringSync(200);
    for (const ch of result) {
      expect(DEFAULT_ALPHA).toContain(ch);
    }
  });

  test("all output characters come from a custom alphabet", () => {
    const alpha = "xyz";
    const result = randomStringSync(100, alpha);
    for (const ch of result) {
      expect(alpha).toContain(ch);
    }
  });

  test("Math.random=0 always picks the first character", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(randomStringSync(4)).toBe("aaaa");
    expect(randomStringSync(3, "XYZ")).toBe("XXX");
  });

  test("Math.random=0.999... picks the last character", () => {
    // Math.floor(0.9999 * len) = len - 1
    vi.spyOn(Math, "random").mockReturnValue(0.9999);
    // Last char of default alphabet is '9'
    expect(randomStringSync(3)).toBe("999");
    expect(randomStringSync(2, "abc")).toBe("cc");
  });

  test("single-char alphabet always returns that character repeated", () => {
    const result = randomStringSync(5, "Q");
    expect(result).toBe("QQQQQ");
  });

  test("n=0 returns empty string", () => {
    expect(randomStringSync(0)).toBe("");
  });
});

describe("randomNumberSync", () => {
  test("returns a number", () => {
    expect(typeof randomNumberSync(4)).toBe("number");
  });

  test("n-digit result is within the valid range", () => {
    for (let i = 0; i < 20; i++) {
      const r = randomNumberSync(4);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(9999);
    }
  });

  test("n=1 is a single digit 0–9", () => {
    for (let i = 0; i < 20; i++) {
      const r = randomNumberSync(1);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(9);
    }
  });

  test("Math.random=0 always picks '0', producing 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(randomNumberSync(4)).toBe(0); // "0000" → 0
    expect(randomNumberSync(1)).toBe(0);
  });

  test("custom alphabet with Math.random=0 picks first char", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    // "111" → Number = 111
    expect(randomNumberSync(3, "123")).toBe(111);
  });
});

describe("async wrappers", () => {
  test("randomString resolves to a string of the requested length", async () => {
    const result = await randomString(8);
    expect(typeof result).toBe("string");
    expect(result).toHaveLength(8);
  });

  test("randomNumber resolves to a number", async () => {
    const result = await randomNumber(4);
    expect(typeof result).toBe("number");
  });
});
