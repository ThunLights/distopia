import { describe, expect, test } from "vitest";

import { lineDiff } from "./index";

describe("lineDiff", () => {
  test("shows a changed line as removed + added", () => {
    expect(lineDiff("hello", "hello world")).toBe("-hello\n+hello world");
  });

  test("keeps unchanged lines as context", () => {
    expect(lineDiff("a\nb\nc", "a\nB\nc")).toBe(" a\n-b\n+B\n c");
  });

  test("marks pure additions and removals", () => {
    expect(lineDiff("a", "a\nb")).toBe(" a\n+b");
    expect(lineDiff("a\nb", "b")).toBe("-a\n b");
    expect(lineDiff("", "new")).toBe("+new");
  });

  test("collapses unchanged lines far from any change", () => {
    const lines = ["1", "2", "3", "4", "5", "6", "7"];
    expect(lineDiff(lines.join("\n"), [...lines.slice(0, 6), "SEVEN"].join("\n"))).toBe(
      " …\n 5\n 6\n-7\n+SEVEN",
    );
    expect(lineDiff(lines.join("\n"), ["ONE", ...lines.slice(1)].join("\n"))).toBe(
      "-1\n+ONE\n 2\n 3\n …",
    );
  });

  test("separates distant changes with an omission marker", () => {
    const lines = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const edited = ["ONE", ...lines.slice(1, 7), "EIGHT"];
    expect(lineDiff(lines.join("\n"), edited.join("\n"))).toBe(
      "-1\n+ONE\n 2\n 3\n …\n 6\n 7\n-8\n+EIGHT",
    );
  });

  test("returns null when the text is unchanged", () => {
    expect(lineDiff("same\ntext", "same\ntext")).toBeNull();
  });
});
