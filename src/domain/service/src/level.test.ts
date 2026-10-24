import { describe, test, expect } from "vitest";

import { formatRank, levelProgress, levelUp, levelUpSync } from "./level";

describe("levelUp", () => {
  test("Sync", () => {
    expect(levelUpSync(2n, 0n, 3n)).toEqual({ level: 2n, point: 3n });
    expect(levelUpSync(2n, 0n, 5n)).toEqual({ level: 3n, point: 1n });
  });
  test("Async", async () => {
    expect(await levelUp(2n, 0n, 3n)).toEqual({ level: 2n, point: 3n });
    expect(await levelUp(2n, 0n, 5n)).toEqual({ level: 3n, point: 1n });
  });
});

describe("levelProgress", () => {
  test("is the fraction of the way to the next level, capped at 1", () => {
    expect(levelProgress({ point: 3n, nextPoint: 12n })).toBe(0.25);
    expect(levelProgress({ point: 20n, nextPoint: 10n })).toBe(1);
  });
});

describe("formatRank", () => {
  test("prefixes a rank and shows a dash when unranked", () => {
    expect(formatRank(null)).toBe("-");
    expect(formatRank(7)).toBe("#7");
  });
});
