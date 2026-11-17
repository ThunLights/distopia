import { describe, expect, test } from "vitest";

import { joinLinesWithinLimit } from "./discordLimits";

describe("joinLinesWithinLimit", () => {
  test("joins all lines when well under the limit", () => {
    expect(joinLinesWithinLimit(["a", "b", "c"], 100)).toBe("a\nb\nc");
  });

  test("returns an empty string for an empty list", () => {
    expect(joinLinesWithinLimit([], 100)).toBe("");
  });

  test("never returns a string longer than the limit, even with many lines", () => {
    const lines = ["aaaaa", "bbbbb", "ccccc", "ddddd"];
    const result = joinLinesWithinLimit(lines, 12);
    expect(result.length).toBeLessThanOrEqual(12);
    expect(result).toContain("他");
  });

  test("never returns a string longer than the limit at Discord's real cap", () => {
    const lines = Array.from({ length: 50 }, (_, i) => `word-${i}-reading-${i}`);
    const result = joinLinesWithinLimit(lines, 2000);
    expect(result.length).toBeLessThanOrEqual(2000);
  });

  test("still fits the omission note even when a single line is already near the limit", () => {
    const lines = ["x".repeat(2000), "y"];
    const result = joinLinesWithinLimit(lines, 2000);
    expect(result.length).toBeLessThanOrEqual(2000);
    expect(result).toContain("他1件");
  });

  test("reports the correct omitted count", () => {
    const lines = ["a".repeat(10), "b".repeat(10), "c".repeat(10)];
    const result = joinLinesWithinLimit(lines, 15);
    expect(result).toContain("他2件");
  });
});
