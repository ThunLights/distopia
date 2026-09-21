import { describe, expect, test } from "vitest";

import { codeBlock, codeBlockPages } from "./codeblock";

describe("codeBlock", () => {
  test("returns a single truncated block for oversized content", async () => {
    const content = "a".repeat(2000);
    const result = await codeBlock(content, undefined, 1024);
    expect(result.length).toBeLessThanOrEqual(1024);
    expect(result).toContain("…");
  });
});

describe("codeBlockPages", () => {
  test("returns a single page when content fits", () => {
    const pages = codeBlockPages("hello", undefined, 1024);
    expect(pages).toHaveLength(1);
    expect(pages[0]).toContain("hello");
  });

  test("splits into two pages when content doesn't fit in one", () => {
    const content = "a".repeat(2000);
    const pages = codeBlockPages(content, undefined, 1024);
    expect(pages).toHaveLength(2);
    for (const page of pages) {
      expect(page.length).toBeLessThanOrEqual(1024);
    }
    expect(pages.join("")).not.toContain("…");
  });

  test("truncates with a marker when content overflows even two pages", () => {
    const content = "a".repeat(5000);
    const pages = codeBlockPages(content, undefined, 1024);
    expect(pages).toHaveLength(2);
    for (const page of pages) {
      expect(page.length).toBeLessThanOrEqual(1024);
    }
    expect(pages[1]).toContain("…");
  });

  test("rejects a maxLength too small to hold the fence", () => {
    expect(() => codeBlockPages("hello", undefined, 4)).toThrow(RangeError);
  });

  test("allows a maxLength equal to the fence overhead for empty content", () => {
    const pages = codeBlockPages("", undefined, 8);
    expect(pages).toHaveLength(1);
  });
});
