// SpecialChar was coded by yuzu.
// https://github.com/yuzu-machan
export class SpecialChar {
  protected static exceptionChars: Record<string, string> = {
    ℬ: "B",
    ℭ: "C",
    ℂ: "C",
    ℰ: "E",
    ℱ: "F",
    ℋ: "H",
    ℌ: "H",
    ℍ: "H",
    ℐ: "J",
    ℑ: "J",
    ℒ: "L",
    ℳ: "M",
    ℕ: "N",
    ℙ: "P",
    ℚ: "Q",
    ℛ: "R",
    ℜ: "R",
    ℝ: "R",
    ℨ: "Z",
    ℤ: "Z",
    ℯ: "e",
    ℊ: "g",
    ℎ: "h",
    ℴ: "o",
    ᴬ: "A",
    ᴮ: "B",
    ᴰ: "D",
    ᴱ: "E",
    ᴳ: "G",
    ᴴ: "H",
    ᴵ: "I",
    ᴶ: "J",
    ᴷ: "K",
    ᴸ: "L",
    ᴹ: "M",
    ᴺ: "N",
    ᴼ: "O",
    ᴾ: "P",
    ᴿ: "R",
    ᵀ: "T",
    ᵁ: "U",
    ᵂ: "W",
    ᵃ: "a",
    ᵇ: "b",
    ᵈ: "d",
    ᵉ: "e",
    ᵍ: "g",
    ᵏ: "k",
    ᵐ: "m",
    ᵒ: "o",
    ᵖ: "p",
    ᵗ: "t",
    ᵘ: "u",
    ᵛ: "v",
    ᵢ: "i",
    ᵣ: "r",
    ᵤ: "u",
    ᵥ: "v",
  };

  protected static specialChar2ASCII = (char: string): string => {
    let a: number | undefined = char.codePointAt(0);
    if (a == null) {
      return "";
    }
    // Explicitly mapped exception characters
    if (char in this.exceptionChars) {
      return this.exceptionChars[char] as string;
    }
    // Fullwidth Latin letters (U+FF21-U+FF5A)
    if (0xff21 <= a && a <= 0xff5a) {
      a -= 0xfee0;
    }
    // Mathematical alphanumeric symbols - letters (U+1D400-U+1D6A3)
    if (0x1d400 <= a && a <= 0x1d6a3) {
      a -= 0x1d400;
      a %= 2 * 26;
      if (a >= 26) {
        a += 6;
      }
      a += 0x41;
    }
    // Mathematical alphanumeric symbols - digits (U+1D7CE-U+1D7FF)
    if (0x1d7ce <= a && a <= 0x1d7ff) {
      a -= 0x1d7ce;
      a %= 10;
      a += 0x30;
    }
    return String.fromCharCode(a);
  };

  public static specialChars2ASCII = (chars: string): string => {
    let charList = [...chars];
    return charList.map((char: string) => this.specialChar2ASCII(char)).join("");
  };
}
