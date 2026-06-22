import { LocalAddressError } from "./Error/LocalAddressError";
import { isLocalUrl } from "./url";

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

export async function isInviteLink(url: string): Promise<IsInviteLink | LocalAddressError> {
  if (isLocalUrl(url)) return new LocalAddressError(`${url} is local address`);

  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  return {
    content: response.url.startsWith("https://discord.com/invite/"),
    isUsedCf: await isUsedCf(response),
  };
}
