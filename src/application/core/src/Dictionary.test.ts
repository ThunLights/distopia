import { describe, expect, test } from "vitest";

import type { AppState } from "./AppState";
import { Dictionary } from "./Dictionary";

// substitute/exportGuildDictionary/parseImport touch no state, so casting an empty object
// is safe here -- only resolve()/importGuildDictionary() actually read this.state.
const dictionary = new Dictionary({} as AppState);

describe("Dictionary.substitute", () => {
  test("replaces a registered word with its reading", () => {
    const map = new Map([["東京", "とうきょう"]]);
    expect(dictionary.substitute("東京タワーに行く", map)).toBe("とうきょうタワーに行く");
  });

  test("prefers the longer word when one word is a substring of another", () => {
    const map = new Map([
      ["東京", "とうきょう"],
      ["東京タワー", "とうきょうタワー(スカイツリーではない)"],
    ]);
    expect(dictionary.substitute("東京タワーに行く", map)).toBe(
      "とうきょうタワー(スカイツリーではない)に行く",
    );
  });

  test("replaces every occurrence of a word", () => {
    const map = new Map([["猫", "ねこ"]]);
    expect(dictionary.substitute("猫と猫", map)).toBe("ねことねこ");
  });

  test("returns the text unchanged when no word matches", () => {
    const map = new Map([["犬", "いぬ"]]);
    expect(dictionary.substitute("猫が好き", map)).toBe("猫が好き");
  });

  test("ignores an empty-string dictionary key instead of looping forever", () => {
    const map = new Map([["", "x"]]);
    expect(dictionary.substitute("hello", map)).toBe("hello");
  });
});

describe("Dictionary export/import round-trip", () => {
  const entries = [
    {
      guildId: "g1",
      word: "東京",
      reading: "とうきょう",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { guildId: "g1", word: "猫", reading: "ねこ", createdAt: new Date(), updatedAt: new Date() },
  ];

  test("json export can be parsed back into the same entries", () => {
    const json = dictionary.exportGuildDictionary(entries, "json");
    const parsed = dictionary.parseImport(json, "json");
    expect(parsed).toEqual({ 東京: "とうきょう", 猫: "ねこ" });
  });

  test("toml export can be parsed back into the same entries", () => {
    const toml = dictionary.exportGuildDictionary(entries, "toml");
    const parsed = dictionary.parseImport(toml, "toml");
    expect(parsed).toEqual({ 東京: "とうきょう", 猫: "ねこ" });
  });

  test("parseImport returns null for malformed JSON", () => {
    expect(dictionary.parseImport("{not valid json", "json")).toBeNull();
  });

  test("parseImport returns null for malformed TOML", () => {
    expect(dictionary.parseImport("[[[not valid toml", "toml")).toBeNull();
  });

  test("parseImport returns null when values aren't all strings", () => {
    expect(dictionary.parseImport(JSON.stringify({ word: 123 }), "json")).toBeNull();
  });
});
