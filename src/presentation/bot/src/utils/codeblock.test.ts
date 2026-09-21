import { describe, expect, test } from "vitest";

import { codeBlockPages } from "./codeblock";

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
});
