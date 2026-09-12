import { z } from "zod";

export type Branded<T, Brand> = T & { readonly __brand: Brand };

/**
 * A string branded as a validated http/https URL. Only obtainable via
 * {@link safeUrl} (template literal, dynamic parts encoded) or
 * {@link validateSafeUrl} (raw string, validated at runtime) — never cast
 * a raw string with `as SafeUrl`, since that bypasses validation entirely.
 */
export type SafeUrl = Branded<string, "distopiaSafeUrl">;

/**
 * Tagged template literal that builds a {@link SafeUrl}, running every
 * interpolated value through `encodeURIComponent`. Use this whenever a URL
 * contains user-controlled or otherwise dynamic parts, so an interpolated
 * value can't inject extra path segments, query parameters, or a different
 * host.
 *
 * @example
 * const url = safeUrl`https://example.com/user/${userId}`;
 */
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

/**
 * Validates that a raw string is a well-formed http or https URL and, if
 * so, brands it as a {@link SafeUrl}. Use this for URLs from external
 * input (DB rows, Discord events, API responses) instead of casting with
 * `as SafeUrl`, which skips validation entirely.
 *
 * @param url - The raw URL string to validate.
 * @returns The branded {@link SafeUrl}, or `null` if `url` is not a
 * parseable http/https URL.
 *
 * @example
 * const url = validateSafeUrl(rawString);
 * if (url === null) return; // invalid — not http/https or malformed
 */
export function validateSafeUrl(url: string): SafeUrl | null {
  const result = safeUrlSchema.safeParse(url);
  return result.success ? result.data : null;
}
