import type { BodySizeError, HeaderError, RedirectError } from "./Error";
import { LocalAddressError } from "./Error/LocalAddressError";
import { safeFetch } from "./safefetch";
import type { SafeUrl } from "./safeurl";

export type IsInviteLink = {
  content: boolean;
  isUsedCf: boolean;
};

export const DISCORD_INVITE_LINK_START = [
  "https://discord.com/invite/",
  "https://ptb.discord.com/invite/",
  "https://canary.discord.com/invite/",
  "discord://discord.com/invite/",
  "discord://ptb.discord.com/invite/",
  "discord://canary.discord.com/invite/",
];

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
    content: DISCORD_INVITE_LINK_START.some(
      (value) => resUrl.startsWith(value) || (location && location.startsWith(value)),
    ),
    isUsedCf: await isUsedCf(response),
  };
}
