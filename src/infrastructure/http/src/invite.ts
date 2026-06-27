import type { BodySizeError, HeaderError, RedirectError } from "./Error";
import { LocalAddressError } from "./Error/LocalAddressError";
import { safeFetch } from "./safefetch";
import type { SafeUrl } from "./safeurl";

export type IsInviteLink = {
  content: boolean;
  isUsedCf: boolean;
};

export const DISCORD_DOMAINS = ["discord.com", "ptb.discord.com", "canary.discord.com"];

export const INVITE_PROTOCOL = ["discord:", "http:", "https:"];

async function isDiscordInviteLink(url: string | URL) {
  const parsedUrl = URL.parse(url);

  if (parsedUrl === null) {
    return false;
  }

  return (
    INVITE_PROTOCOL.includes(parsedUrl.protocol) &&
    DISCORD_DOMAINS.includes(parsedUrl.host) &&
    parsedUrl.pathname.startsWith("/invite/")
  );
}

// this function is fucking shit.
// I will fix it someday.
export async function isUsedCf(res: Response) {
  try {
    const response = res.clone();

    if (response.status !== 403) {
      return false;
    }

    const { JSDOM } = await import("jsdom");

    const html = await response.text();
    const jsdom = new JSDOM(html);
    const title = jsdom.window.document.querySelector("title");

    return title?.textContent === "Just a moment...";
  } catch {
    return false;
  }
}

export async function isInviteLink(
  url: string,
): Promise<IsInviteLink | LocalAddressError | HeaderError | RedirectError | BodySizeError> {
  const response = await safeFetch(
    url as SafeUrl,
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
    isUsedCf: await isUsedCf(response),
  };
}
