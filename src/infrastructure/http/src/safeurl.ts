import { z } from "zod";

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

const safeUrlSchema = z
  .string()
  .refine(
    (url) => {
      const parsed = URL.parse(url);
      return parsed !== null && (parsed.protocol === "http:" || parsed.protocol === "https:");
    },
    { message: "URL must be a valid http or https URL" },
  )
  .transform((url) => url as SafeUrl);

// Validates that a raw string URL is http/https and well-formed before branding it as SafeUrl.
// Use this instead of `url as SafeUrl` when receiving URLs from external input.
export function validateSafeUrl(url: string): SafeUrl | null {
  const result = safeUrlSchema.safeParse(url);
  return result.success ? result.data : null;
}
