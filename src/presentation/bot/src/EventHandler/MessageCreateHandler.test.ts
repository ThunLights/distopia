import { describe, expect, test } from "vitest";

import { isMediaOnlyMessage } from "./MessageCreateHandler";

describe("isMediaOnlyMessage", () => {
  test("false when there are no attachments", () => {
    expect(isMediaOnlyMessage([])).toBe(false);
  });

  test("true for a single image attachment", () => {
    expect(isMediaOnlyMessage(["image/png"])).toBe(true);
  });

  test("true for a single video attachment", () => {
    expect(isMediaOnlyMessage(["video/mp4"])).toBe(true);
  });

  test("true when every attachment is an image or video", () => {
    expect(isMediaOnlyMessage(["image/png", "video/mp4", "image/gif"])).toBe(true);
  });

  test("false when any attachment is neither image nor video", () => {
    expect(isMediaOnlyMessage(["image/png", "application/pdf"])).toBe(false);
  });

  test("false when the content type is missing (e.g. an unrecognized file)", () => {
    expect(isMediaOnlyMessage([null])).toBe(false);
  });
});
