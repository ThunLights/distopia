import { useAsync } from "./async";
import { SpecialChar } from "./string";

export type FindUrls = {
  inviteLinks: string[];
  normalUrls: string[];
};

export const URL_REGEXP = /https?:\/\/[\w/:%#$&?()~.=+-]+/im;

export const URL_REGEXP_DISCORD_GG = /(?:https?:\/\/)?discord\.gg\/[a-zA-Z0-9_-]+/im;

export const URL_REGEXP_DISCORD_COM =
  /(?:https?:\/\/)?(?:(discord\.com)|(discordapp\.com))\/?.*invite.*([a-zA-Z0-9_-]+)\b/im;

export function findUrlsSync(content: string): FindUrls {
  const inviteLinks: string[] = [];
  const normalUrls: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const ALL_URL_REGEXP = new RegExp(
      URL_REGEXP.source + URL_REGEXP_DISCORD_GG.source + URL_REGEXP_DISCORD_COM.source,
      "gmi",
    );
    const urls = line.split(ALL_URL_REGEXP);

    for (const url of urls
      .filter((url) => url)
      .map((value) => SpecialChar.specialChars2ASCII(value))) {
      const isInviteLink = new RegExp(
        URL_REGEXP_DISCORD_GG.source + URL_REGEXP_DISCORD_COM.source,
        "gmi",
      ).test(url);
      const isUrl = new RegExp(URL_REGEXP.source, "gmi").test(url);

      if (isInviteLink || URL_REGEXP_DISCORD_GG.test(url) || URL_REGEXP_DISCORD_COM.test(url)) {
        inviteLinks.push(url);
      } else if (isUrl) {
        normalUrls.push(url);
      }
    }
  }

  return {
    inviteLinks,
    normalUrls,
  };
}

export const findUrls = useAsync(findUrlsSync);
