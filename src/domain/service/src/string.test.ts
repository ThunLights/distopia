import { describe, expect, test } from "vitest";

import { SpecialChar } from "./string";

const convert = SpecialChar.specialChars2ASCII.bind(SpecialChar);

describe("SpecialChar.specialChars2ASCII", () => {
  test("empty string returns empty string", () => {
    expect(convert("")).toBe("");
  });

  test("plain ASCII characters pass through unchanged", () => {
    expect(convert("abc")).toBe("abc");
    expect(convert("ABC")).toBe("ABC");
    expect(convert("Hello World 123!")).toBe("Hello World 123!");
  });

  // ── Exception chars (explicitly mapped in exceptionChars) ──────────────────

  test.each([
    ["ℬ", "B"],
    ["ℭ", "C"],
    ["ℂ", "C"],
    ["ℰ", "E"],
    ["ℱ", "F"],
    ["ℋ", "H"],
    ["ℌ", "H"],
    ["ℍ", "H"],
    ["ℐ", "J"],
    ["ℑ", "J"],
    ["ℒ", "L"],
    ["ℳ", "M"],
    ["ℕ", "N"],
    ["ℙ", "P"],
    ["ℚ", "Q"],
    ["ℛ", "R"],
    ["ℜ", "R"],
    ["ℝ", "R"],
    ["ℨ", "Z"],
    ["ℤ", "Z"],
    ["ℯ", "e"],
    ["ℊ", "g"],
    ["ℎ", "h"],
    ["ℴ", "o"],
  ] as [string, string][])("exception char %s → %s", (input, expected) => {
    expect(convert(input)).toBe(expected);
  });

  // ── Superscript exception chars ────────────────────────────────────────────

  test.each([
    ["ᴬ", "A"],
    ["ᴮ", "B"],
    ["ᴰ", "D"],
    ["ᴱ", "E"],
    ["ᴳ", "G"],
    ["ᴴ", "H"],
    ["ᴵ", "I"],
    ["ᴶ", "J"],
    ["ᴷ", "K"],
    ["ᴸ", "L"],
    ["ᴹ", "M"],
    ["ᴺ", "N"],
    ["ᴼ", "O"],
    ["ᴾ", "P"],
    ["ᴿ", "R"],
    ["ᵀ", "T"],
    ["ᵁ", "U"],
    ["ᵂ", "W"],
    ["ᵃ", "a"],
    ["ᵇ", "b"],
    ["ᵈ", "d"],
    ["ᵉ", "e"],
    ["ᵍ", "g"],
    ["ᵏ", "k"],
    ["ᵐ", "m"],
    ["ᵒ", "o"],
    ["ᵖ", "p"],
    ["ᵗ", "t"],
    ["ᵘ", "u"],
    ["ᵛ", "v"],
    ["ᵢ", "i"],
    ["ᵣ", "r"],
    ["ᵤ", "u"],
    ["ᵥ", "v"],
  ] as [string, string][])("superscript char %s → %s", (input, expected) => {
    expect(convert(input)).toBe(expected);
  });

  // ── Fullwidth Latin letters (U+FF21–U+FF5A) ────────────────────────────────

  test("fullwidth uppercase Ａ–Ｚ convert to ASCII A–Z", () => {
    // U+FF21 = Ａ, U+FF3A = Ｚ
    expect(convert("Ａ")).toBe("A");
    expect(convert("Ｚ")).toBe("Z");
    expect(convert("Ｈｅｌｌｏ")).toBe("Hello");
  });

  test("fullwidth lowercase ａ–ｚ convert to ASCII a–z", () => {
    // U+FF41 = ａ, U+FF5A = ｚ
    expect(convert("ａ")).toBe("a");
    expect(convert("ｚ")).toBe("z");
  });

  // Fullwidth digits (U+FF10–U+FF19) are outside the checked range and are NOT converted.
  test("fullwidth digits are NOT converted (outside range U+FF21–U+FF5A)", () => {
    expect(convert("０")).toBe("０");
    expect(convert("９")).toBe("９");
  });

  // ── Mathematical alphanumeric symbols (U+1D400–U+1D6A3) ───────────────────

  test("mathematical bold capital A–Z → ASCII A–Z", () => {
    // U+1D400 = 𝐀 (Mathematical Bold Capital A)
    // U+1D419 = 𝐙 (Mathematical Bold Capital Z)
    expect(convert("𝐀")).toBe("A");
    expect(convert("𝐙")).toBe("Z");
  });

  test("mathematical bold small a–z → ASCII a–z", () => {
    // U+1D41A = 𝐚 (Mathematical Bold Small A)
    // U+1D433 = 𝐳 (Mathematical Bold Small Z)
    expect(convert("𝐚")).toBe("a");
    expect(convert("𝐳")).toBe("z");
  });

  test("different mathematical styles of A still map to A (mod-52 cycling)", () => {
    // U+1D434 = 𝑨 (Mathematical Italic Capital A) → same A via mod 52
    expect(convert("𝑨")).toBe("A");
  });

  // ── Mathematical digits (U+1D7CE–U+1D7FF) ─────────────────────────────────

  test("mathematical bold digits 0–9 → ASCII 0–9", () => {
    // U+1D7CE = 𝟎, U+1D7D7 = 𝟗
    expect(convert("𝟎")).toBe("0");
    expect(convert("𝟗")).toBe("9");
  });

  // ── Multi-character strings ────────────────────────────────────────────────

  test("mixed string: each character is converted independently", () => {
    // ℬig → Big (ℬ is exception char → B; 'i' and 'g' are plain ASCII)
    expect(convert("ℬig")).toBe("Big");
  });

  test("obfuscated Discord invite pattern used in url.ts tests converts correctly", () => {
    // Spot-check one of the obfuscated chars from the url.test.ts fixture:
    // ｃ (U+FF43) is fullwidth lowercase c → 'c'
    expect(convert("ｃ")).toBe("c");
    // ᵈ (superscript d) is an exception char → 'd'
    expect(convert("ᵈ")).toBe("d");
  });
});
