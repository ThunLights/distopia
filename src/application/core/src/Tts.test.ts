import { describe, expect, test } from "vitest";

import type { AppState } from "./AppState";
import type { Guild } from "./Guild";
import { Tts } from "./Tts";

// stripFilteredPatterns touches neither this.state nor this.guild, so casting empty objects
// is safe here -- the other methods on this class need real state/guild collaborators.
const tts = new Tts({} as AppState, {} as Guild);

describe("Tts.stripFilteredPatterns", () => {
  test("strips a bare URL when skipUrl is enabled", () => {
    const result = tts.stripFilteredPatterns("見て https://example.com/path すごい", {
      skipUrl: true,
      skipCodeBlock: true,
    });
    expect(result).not.toContain("https://example.com");
  });

  test("leaves a URL untouched when skipUrl is disabled", () => {
    const result = tts.stripFilteredPatterns("見て https://example.com/path すごい", {
      skipUrl: false,
      skipCodeBlock: true,
    });
    expect(result).toContain("https://example.com/path");
  });

  test("strips a fenced code block when skipCodeBlock is enabled", () => {
    const result = tts.stripFilteredPatterns("説明: ```const x = 1;``` 以上です", {
      skipUrl: true,
      skipCodeBlock: true,
    });
    expect(result).not.toContain("const x = 1;");
  });

  test("leaves a fenced code block untouched when skipCodeBlock is disabled", () => {
    const result = tts.stripFilteredPatterns("説明: ```const x = 1;``` 以上です", {
      skipUrl: true,
      skipCodeBlock: false,
    });
    expect(result).toContain("const x = 1;");
  });

  test("strips both a URL and a code block in the same message", () => {
    const result = tts.stripFilteredPatterns("```code``` https://example.com", {
      skipUrl: true,
      skipCodeBlock: true,
    });
    expect(result.trim()).toBe("");
  });

  test("returns plain text unchanged when nothing matches", () => {
    const result = tts.stripFilteredPatterns("ただのメッセージです", {
      skipUrl: true,
      skipCodeBlock: true,
    });
    expect(result).toBe("ただのメッセージです");
  });
});

describe("Tts.truncateForReading", () => {
  test("leaves text at or under the max length unchanged", () => {
    const text = "a".repeat(300);
    expect(tts.truncateForReading(text)).toBe(text);
  });

  test("cuts text over the max length to exactly 300 characters plus an omission note", () => {
    const text = "a".repeat(320);
    const result = tts.truncateForReading(text);
    expect(result).toBe(`${"a".repeat(300)} 以下20文字を省略`);
  });

  test("respects a custom max length", () => {
    const result = tts.truncateForReading("abcdefghij", 5);
    expect(result).toBe("abcde 以下5文字を省略");
  });

  test("leaves short text untouched", () => {
    expect(tts.truncateForReading("短いメッセージ")).toBe("短いメッセージ");
  });
});
