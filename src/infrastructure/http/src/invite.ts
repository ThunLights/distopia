import type { BodySizeError, HeaderError, RedirectError } from "./Error";
import { LocalAddressError } from "./Error/LocalAddressError";
import { safeFetch } from "./safefetch";
import { validateSafeUrl } from "./safeurl";

/** Result of {@link isInviteLink}. */
export type IsInviteLink = {
  /** True if the resolved URL, or its redirect target, is a Discord invite link. */
  content: boolean;
  /** True if the response was a Cloudflare challenge page — see {@link isUsedCf}. */
  isUsedCf: boolean;
};

export const DISCORD_DOMAINS = ["discord.com", "ptb.discord.com", "canary.discord.com"];

export const INVITE_PROTOCOL = ["discord:", "http:", "https:"];

async function isDiscordInviteLink(url: string | URL) {
  const parsedUrl = URL.parse(url.toString());

  if (parsedUrl === null) {
    return false;
  }

  return (
    INVITE_PROTOCOL.includes(parsedUrl.protocol) &&
    DISCORD_DOMAINS.includes(parsedUrl.host) &&
    parsedUrl.pathname.startsWith("/invite/")
  );
}

/**
 * Detects Cloudflare challenge pages via the `cf-mitigated: challenge`
 * response header — reliable across JS challenges, managed challenges, and
 * CAPTCHAs, regardless of status code or response language.
 */
export function isUsedCf(res: Response): boolean {
  return res.headers.get("cf-mitigated") === "challenge";
}

/**
 * Resolves `url` through {@link safeFetch} (following redirects, with
 * `detectDiscordProtocol` enabled) and checks whether the final URL, or
 * its `Location` header, is a Discord invite link
 * (`discord.com`/`ptb.discord.com`/`canary.discord.com` + `/invite/...`,
 * or a `discord://` deep link).
 *
 * @param url - The raw URL string to check; validated internally via
 * {@link validateSafeUrl}.
 * @returns `{ content, isUsedCf }` (see {@link IsInviteLink}) on success —
 * `content` is `false`, not an error, when the fetch succeeds but the
 * resolved URL simply isn't a Discord invite link. Returns
 * {@link LocalAddressError} if `url` isn't a safe http/https URL or
 * resolves to a private/local IP, or one of {@link HeaderError},
 * {@link RedirectError}, {@link BodySizeError} if the underlying fetch fails.
 *
 * @example
 * const result = await isInviteLink("https://discord.gg/abc123");
 * if (!(result instanceof Error) && result.content) { ... }
 */
export async function isInviteLink(
  url: string,
): Promise<IsInviteLink | LocalAddressError | HeaderError | RedirectError | BodySizeError> {
  const safeUrl = validateSafeUrl(url);
  if (safeUrl === null) return new LocalAddressError(`${url} is not a safe URL.`);

  const response = await safeFetch(
    safeUrl,
    {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    },
    {
      detectDiscordProtocol: true,
    },
  );

  if (response instanceof Error) {
    return response;
  }

  const resUrl = response.url;
  const location = response.headers.get("location");

  return {
    content:
      (await isDiscordInviteLink(resUrl)) ||
      (location !== null && (await isDiscordInviteLink(location))),
    isUsedCf: isUsedCf(response),
  };
}
