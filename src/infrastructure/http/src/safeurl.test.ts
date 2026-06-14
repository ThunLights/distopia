import { describe, expect, test } from "vitest";

import { safeUrl } from "./safeurl";

describe("safeUrl", () => {
  test("normal txt", () => {
    const url = safeUrl`https://example.com/hogehoge/fugafuga`;
    expect(url).toBe("https://example.com/hogehoge/fugafuga");
  });

  test("malicious script", () => {
    const script = "hogehoge/123456#";
    const url = safeUrl`https://example.com/${script}/fugafuga`;
    expect(url).toBe("https://example.com/hogehoge%2F123456%23/fugafuga");
  });
});
