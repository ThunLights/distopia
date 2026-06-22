import type { BodySizeError, HeaderError, RedirectError } from "./Error";
import { LocalAddressError } from "./Error/LocalAddressError";
import { safeFetch } from "./safefetch";
import type { SafeUrl } from "./safeurl";

export type IsInviteLink = {
  content: boolean;
  isUsedCf: boolean;
};

// this function is fucking shit.
// I will fix it someday.
export async function isUsedCf(response: Response) {
  try {
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
  const response = await safeFetch(url as SafeUrl, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (response instanceof Error) {
    return response;
  }

  return {
    content: response.url.startsWith("https://discord.com/invite/"),
    isUsedCf: await isUsedCf(response),
  };
}
