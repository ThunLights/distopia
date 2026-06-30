import type { BodySizeError, HeaderError, RedirectError } from "./Error";
import { LocalAddressError } from "./Error/LocalAddressError";
import { safeFetch } from "./safefetch";
import { validateSafeUrl } from "./safeurl";

export type IsInviteLink = {
  content: boolean;
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

// Detects Cloudflare challenge pages via the cf-mitigated response header.
// Cloudflare sets cf-mitigated: challenge on JS challenges, managed challenges,
// and CAPTCHAs regardless of status code or response language.
export function isUsedCf(res: Response): boolean {
  return res.headers.get("cf-mitigated") === "challenge";
}

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
