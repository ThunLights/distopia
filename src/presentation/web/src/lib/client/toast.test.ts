import { escapeHtml } from "./toast";
import { describe, expect, it } from "vitest";

describe("escapeHtml", () => {
  it("neutralizes markup in a guild name before it reaches svelte-toast's {@html}", () => {
    expect(escapeHtml(`「<img src=x onerror="alert(1)">」に参加しました`)).toBe(
      "「&lt;img src=x onerror=&quot;alert(1)&quot;&gt;」に参加しました",
    );
  });

  it("escapes & first so existing entities aren't double-decoded", () => {
    expect(escapeHtml("&lt;b&gt;")).toBe("&amp;lt;b&amp;gt;");
  });
});
