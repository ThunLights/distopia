export type Branded<T, Brand> = T & { readonly __brand: Brand };

export type SafeUrl = Branded<string, "distopiaSafeUrl">;

export function safeUrl(strings: TemplateStringsArray, ...values: (string | number)[]) {
  let result = "";

  for (const [index, str] of strings.entries()) {
    result += str;
    const value = values[index];
    if (value) {
      result += encodeURIComponent(value);
    }
  }

  return result as SafeUrl;
}
