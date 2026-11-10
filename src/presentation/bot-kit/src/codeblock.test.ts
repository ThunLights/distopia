import { describe, expect, test } from "vitest";

import { codeBlock, codeBlockChunks } from "./codeblock";

describe("codeBlock", () => {
  test("returns a single truncated block for oversized content", async () => {
    const content = "a".repeat(2000);
    const result = await codeBlock(content, undefined, 1024);
    expect(result.length).toBeLessThanOrEqual(1024);
    expect(result).toContain("…");
  });
});

const unfence = (page: string, lang = "") => page.slice(`\`\`\`${lang}\n`.length, -"```\n".length);

describe("codeBlockChunks", () => {
  test("returns a single page when content fits", () => {
    expect(codeBlockChunks("hello")).toEqual(["```\nhello```\n"]);
  });

  test("never truncates: every character survives across however many pages it takes", () => {
    const content = "a".repeat(5000);
    const pages = codeBlockChunks(content);
    expect(pages.length).toBeGreaterThan(2);
    for (const page of pages) {
      expect(page.length).toBeLessThanOrEqual(1024);
    }
    expect(pages.map((page) => unfence(page)).join("")).toBe(content);
  });

  test("breaks pages between lines when lines fit", () => {
    const lines = Array.from({ length: 30 }, (_, i) => `${i}`.padEnd(60, "x"));
    const pages = codeBlockChunks(lines.join("\n"));
    expect(pages.flatMap((page) => unfence(page).split("\n"))).toEqual(lines);
  });

  test("repeats the diff marker on every piece of a split long line", () => {
    const pages = codeBlockChunks(`-${"o".repeat(1500)}\n+${"n".repeat(1500)}`, "diff");
    const lines = pages.flatMap((page) => unfence(page, "diff").split("\n"));
    expect(lines.length).toBeGreaterThan(2);
    expect(lines.every((line) => line.startsWith("-") || line.startsWith("+"))).toBe(true);
    expect(
      lines
        .filter((line) => line.startsWith("+"))
        .join("")
        .replaceAll("+", ""),
    ).toBe("n".repeat(1500));
  });

  test("never splits an emoji or a backtick escape", () => {
    const pages = codeBlockChunks("😀`".repeat(600));
    for (const page of pages) {
      expect(page.length).toBeLessThanOrEqual(1024);
      const body = unfence(page);
      // Every page re-joins into whole "😀" and "\`" units: no lone surrogate, no dangling "\".
      expect(body.replaceAll("😀", "").replaceAll("\\`", "")).toBe("");
    }
  });

  test("rejects a maxLength too small to hold the fence", () => {
    expect(() => codeBlockChunks("hello", "", 8)).toThrow(RangeError);
  });
});
