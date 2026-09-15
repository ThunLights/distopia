import { describe, expect, test } from "vitest";

import { isMediaOnlyMessage, resolveMentions } from "./MessageCreateHandler";

describe("resolveMentions", () => {
  const mentions = {
    getUserName: (id: string) => (id === "1" ? "たなかたろう" : undefined),
    getRoleName: (id: string) => (id === "2" ? "モデレーター" : undefined),
    getChannelName: (id: string) => (id === "3" ? "一般" : undefined),
  };

  test("replaces a user mention with the resolved display name", () => {
    expect(resolveMentions("<@1> おはよう", mentions)).toBe("たなかたろう おはよう");
  });

  test("replaces a legacy nickname-mention (<@!id>) the same as <@id>", () => {
    expect(resolveMentions("<@!1> おはよう", mentions)).toBe("たなかたろう おはよう");
  });

  test("replaces a role mention with the resolved role name", () => {
    expect(resolveMentions("<@&2> です", mentions)).toBe("モデレーター です");
  });

  test("replaces a channel mention with the resolved channel name", () => {
    expect(resolveMentions("<#3> を見て", mentions)).toBe("一般 を見て");
  });

  test("replaces multiple mentions in one message", () => {
    expect(resolveMentions("<@1> <@&2> <#3>", mentions)).toBe("たなかたろう モデレーター 一般");
  });

  test("leaves an unresolvable mention token untouched (e.g. member already left)", () => {
    expect(resolveMentions("<@999> おはよう", mentions)).toBe("<@999> おはよう");
  });

  test("leaves text with no mention tokens untouched", () => {
    expect(resolveMentions("こんにちは", mentions)).toBe("こんにちは");
  });
});

describe("isMediaOnlyMessage", () => {
  test("false when there are no attachments", () => {
    expect(isMediaOnlyMessage("", [])).toBe(false);
  });

  test("true for a single image attachment with no caption", () => {
    expect(isMediaOnlyMessage("", ["image/png"])).toBe(true);
  });

  test("true for a single video attachment with no caption", () => {
    expect(isMediaOnlyMessage("", ["video/mp4"])).toBe(true);
  });

  test("true when every attachment is an image or video", () => {
    expect(isMediaOnlyMessage("", ["image/png", "video/mp4", "image/gif"])).toBe(true);
  });

  test("false when any attachment is neither image nor video", () => {
    expect(isMediaOnlyMessage("", ["image/png", "application/pdf"])).toBe(false);
  });

  test("false when the content type is missing (e.g. an unrecognized file)", () => {
    expect(isMediaOnlyMessage("", [null])).toBe(false);
  });

  test("false for a normal caption alongside an image", () => {
    expect(isMediaOnlyMessage("check this out", ["image/png"])).toBe(false);
  });

  // Regression: a caption that stripFilteredPatterns would remove entirely (e.g. a bare URL
  // with skipUrl on) still means the user typed something -- the raw, unfiltered content is
  // what must decide this, not the post-filter text readAloud reads aloud.
  test("false for an image whose caption is only a URL (would be stripped to empty)", () => {
    expect(isMediaOnlyMessage("https://example.com", ["image/png"])).toBe(false);
  });

  test("true when the raw content is whitespace-only (trimmed to empty, same as no caption)", () => {
    expect(isMediaOnlyMessage("   ", ["image/png"])).toBe(true);
  });
});
