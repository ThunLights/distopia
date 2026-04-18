import { describe, expect, test } from "vitest";

import { isBlank, isBlankSync } from "./blank";

describe("isBlank", async () => {
  test("sync", async () => {
    expect(isBlankSync("")).toBe(true);
    expect(isBlankSync("abc")).toBe(false);
    expect(isBlankSync("\n\n\t")).toBe(true);
    expect(isBlankSync(" abc ")).toBe(false);
  });
  test("async", async () => {
    expect(await isBlank("")).toBe(true);
    expect(await isBlank("abc")).toBe(false);
    expect(await isBlank("\n\n\t")).toBe(true);
    expect(await isBlank(" abc ")).toBe(false);
  });
});
