import { describe, expect, test } from "vitest";

import { omitLine, omitLineSync, omitTxt, omitTxtSync } from "./omit";

describe("omitTxt", async () => {
  test("sync", async () => {
    expect(omitTxtSync("hogehoge", 4)).toBe("hoge...(省略)");
    expect(omitTxtSync("hoge", 4)).toBe("hoge");
  });
  test("async", async () => {
    expect(await omitTxt("hogehoge", 4)).toBe("hoge...(省略)");
    expect(await omitTxt("hoge", 4)).toBe("hoge");
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
