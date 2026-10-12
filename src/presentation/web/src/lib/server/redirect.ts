// Same-origin relative path only -- must start with "/" but not "//" (protocol-relative,
// e.g. "//evil.com" is parsed by browsers as "https://evil.com") to prevent an open redirect.
export function parseRedirectTo(raw: string | null): string | undefined {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }
  return undefined;
}
