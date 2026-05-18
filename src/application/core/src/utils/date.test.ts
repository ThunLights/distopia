import { describe, expect, test } from "vitest";

import { formatYMD, formatYMDString, formatYMDStringSync, formatYMDSync } from "./date";

describe("formatYMD", () => {
  test("Sync", () => {
    const date = new Date("2026-1-1");
    expect(formatYMDSync(date)).toEqual(new Date("2026-1-1"));
  });
  test("Async", async () => {
    const date = new Date("2026-1-1");
    expect(await formatYMD(date)).toEqual(new Date("2026-1-1"));
  });
});

describe("formatYMDString", () => {
  test("Sync", () => {
    const date = new Date("2026-1-1");
    expect(formatYMDStringSync(date)).toBe("2026/01/01");
  });
  test("Async", async () => {
    const date = new Date("2026-1-1");
    expect(await formatYMDString(date)).toBe("2026/01/01");
  });
});
