import { describe, expect, test } from "vitest";

import { isMediaOnlyMessage } from "./MessageCreateHandler";

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
