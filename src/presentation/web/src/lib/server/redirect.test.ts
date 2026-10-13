import { parseRedirectTo } from "./redirect";
import { describe, expect, it } from "vitest";

describe("parseRedirectTo", () => {
  it("accepts a same-origin relative path", () => {
    expect(parseRedirectTo("/verify/123")).toBe("/verify/123");
  });

  it("rejects a protocol-relative path (open redirect)", () => {
    expect(parseRedirectTo("//evil.com")).toBeUndefined();
  });

  it("rejects a backslash disguised as a protocol-relative path (open redirect)", () => {
    expect(parseRedirectTo("/\\evil.com")).toBeUndefined();
    expect(parseRedirectTo("\\/evil.com")).toBeUndefined();
  });

  it("rejects an absolute URL", () => {
    expect(parseRedirectTo("https://evil.com")).toBeUndefined();
  });

  it("rejects a path that doesn't start with /", () => {
    expect(parseRedirectTo("verify/123")).toBeUndefined();
  });

  it("returns undefined when absent", () => {
    expect(parseRedirectTo(null)).toBeUndefined();
  });
});
