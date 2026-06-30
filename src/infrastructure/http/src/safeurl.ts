export type Branded<T, Brand> = T & { readonly __brand: Brand };

export type SafeUrl = Branded<string, "distopiaSafeUrl">;

export function safeUrl(strings: TemplateStringsArray, ...values: (string | number)[]) {
  let result = "";

  for (const [index, str] of strings.entries()) {
    result += str;
    const value = values[index];
    if (value !== undefined) {
      result += encodeURIComponent(value);
    }
  }

  return result as SafeUrl;
}

// Validates that a raw string URL is http/https and well-formed before branding it as SafeUrl.
// Use this instead of `url as SafeUrl` when receiving URLs from external input.
export function validateSafeUrl(url: string): SafeUrl | null {
  const parsed = URL.parse(url);
  if (parsed === null) return null;
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  return url as SafeUrl;
}
