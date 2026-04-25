import { describe, expect, test } from "vitest";

import { formatYMD, formatYMDSync } from "./date";

describe("formatYMD", () => {
  test("Sync", () => {
    const date = new Date("2026-1-1");
    expect(formatYMDSync(date)).toBe("2026/01/01");
  });
  test("Async", async () => {
    const date = new Date("2026-1-1");
    expect(await formatYMD(date)).toBe("2026/01/01");
  });
});
