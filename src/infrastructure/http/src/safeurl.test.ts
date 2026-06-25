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

  test("encodes & to prevent query-string injection", () => {
    const param = "value&admin=true";
    const url = safeUrl`https://example.com/search?q=${param}`;
    expect(url).toBe("https://example.com/search?q=value%26admin%3Dtrue");
  });

  test("encodes = to prevent key/value injection", () => {
    const param = "a=b";
    const url = safeUrl`https://example.com/?key=${param}`;
    expect(url).toBe("https://example.com/?key=a%3Db");
  });

  test("encodes ? to prevent query-string injection", () => {
    const param = "foo?bar=baz";
    const url = safeUrl`https://example.com/path/${param}`;
    expect(url).toBe("https://example.com/path/foo%3Fbar%3Dbaz");
  });

  test("encodes spaces", () => {
    const param = "hello world";
    const url = safeUrl`https://example.com/search?q=${param}`;
    expect(url).toBe("https://example.com/search?q=hello%20world");
  });

  test("encodes < and > to prevent HTML/XSS injection via URL", () => {
    const param = "<script>alert(1)</script>";
    const url = safeUrl`https://example.com/?x=${param}`;
    expect(url).toBe("https://example.com/?x=%3Cscript%3Ealert(1)%3C%2Fscript%3E");
  });

  test("encodes % to prevent double-decoding attacks", () => {
    const param = "%2Fadmin";
    const url = safeUrl`https://example.com/path/${param}`;
    expect(url).toBe("https://example.com/path/%252Fadmin");
  });

  test("encodes multiple interpolated values independently", () => {
    const id = "user/123";
    const tag = "a&b";
    const url = safeUrl`https://example.com/${id}/tags/${tag}`;
    expect(url).toBe("https://example.com/user%2F123/tags/a%26b");
  });

  test("encodes number values correctly", () => {
    const id = 42;
    const url = safeUrl`https://example.com/items/${id}`;
    expect(url).toBe("https://example.com/items/42");
  });

  test("empty string value produces no extra characters", () => {
    const url = safeUrl`https://example.com/path/${""}`;
    expect(url).toBe("https://example.com/path/");
  });

  test("no interpolation leaves template unchanged", () => {
    const url = safeUrl`https://example.com/no/interpolation`;
    expect(url).toBe("https://example.com/no/interpolation");
  });
});
