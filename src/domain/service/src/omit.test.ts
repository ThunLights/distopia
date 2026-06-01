import { describe, expect, test } from "vitest";

import { omitLine, omitLineSync, omitTxt, omitTxtSync } from "./omit";

describe("omitTxt", async () => {
  test("sync", async () => {
    expect(omitTxtSync("hogehoge", 4)).toBe("hoge...(省略)");
    expect(omitTxtSync("foo", 4)).toBe("foo");
  });
  test("async", async () => {
    expect(await omitTxt("hogehoge", 4)).toBe("hoge...(省略)");
    expect(await omitTxt("foo", 4)).toBe("foo");
  });
});

describe("omitLine", () => {
  test("sync", async () => {
    expect(omitLineSync(["hoge", "fuga", "foo"].join("\n"), 3)).toBe("hoge\nfuga\nfoo");
    expect(omitLineSync(["hoge", "fuga", "foo", "baz"].join("\n"), 3)).toBe(
      "hoge\nfuga\nfoo\n(以下省略)",
    );
  });
  test("async", async () => {
    expect(await omitLine(["hoge", "fuga", "foo"].join("\n"), 3)).toBe("hoge\nfuga\nfoo");
    expect(await omitLine(["hoge", "fuga", "foo", "baz"].join("\n"), 3)).toBe(
      "hoge\nfuga\nfoo\n(以下省略)",
    );
  });
});
