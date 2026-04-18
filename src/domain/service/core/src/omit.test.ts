import { describe, expect, test } from "vitest";

import { omitTxt, omitTxtSync } from "./omit";

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
