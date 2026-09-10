import { describe, expect, test } from "vitest";

import { FAMOUS_SPEAKERS, speakerName } from "./speakers";

describe("speakerName", () => {
  test("returns the known name for a famous speaker id", () => {
    expect(speakerName(3)).toBe("ずんだもん (ノーマル)");
  });

  test("falls back to a generic label for an unknown speaker id", () => {
    expect(speakerName(999)).toBe("話者ID 999");
  });

  test("every famous speaker id resolves to its own entry", () => {
    for (const speaker of FAMOUS_SPEAKERS) {
      expect(speakerName(speaker.value)).toBe(speaker.name);
    }
  });
});
