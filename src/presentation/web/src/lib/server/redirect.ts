// Same-origin relative path only -- must start with "/" but not "//" (protocol-relative,
// e.g. "//evil.com" is parsed by browsers as "https://evil.com") to prevent an open redirect.
// Browsers also treat "\" the same as "/" while parsing a URL with a special scheme, so
// "/\evil.com" (and any other mix of slashes/backslashes) normalizes to that same
// protocol-relative "//evil.com" form -- normalize before checking, not after.
export function parseRedirectTo(raw: string | null): string | undefined {
  if (raw && raw.startsWith("/") && !raw.replace(/\\/g, "/").startsWith("//")) {
    return raw;
  }
  return undefined;
}
