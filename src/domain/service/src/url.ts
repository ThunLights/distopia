import { useAsync } from "./async";
import { SpecialChar } from "./string";

export type FindUrls = {
  inviteLinks: string[];
  normalUrls: string[];
};

export const URL_REGEXP = /^https?:\/\/[\w/:%#$&?()~.=+-]+$/gim;

export const URL_REGEXP_NO_HTTP = /(?:https?:\/\/)?(?:discord).*gg.*([a-zA-Z0-9_-]+)/gim;

export const URL_REGEXP_INVITE_NO_HTTP =
  /(?:https?:\/\/)?(?:discord)\.(?:[a-z]{2,6})\/?.*invite.*([a-zA-Z0-9_-]+)\b|(?:https?:\/\/)?(?:discordapp)\.(?:[a-z]{2,6})\/?.*invite.*([a-zA-Z0-9_-]+)/gim;

export const regExp = new RegExp(
  URL_REGEXP.source + URL_REGEXP_NO_HTTP.source + URL_REGEXP_INVITE_NO_HTTP.source,
  "gmi",
);

export function findUrlsSync(content: string): FindUrls {
  const inviteLinks: string[] = [];
  const normalUrls: string[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const urls = line.split(regExp);
    for (const url of urls.map((value) => SpecialChar.specialChars2ASCII(value))) {
      const isInviteLink = new RegExp(
        URL_REGEXP_NO_HTTP.source + URL_REGEXP_INVITE_NO_HTTP.source,
        "gmi",
      ).test(url);
      const isUrl = new RegExp(URL_REGEXP, "gmi").test(url);

      if (isInviteLink || URL_REGEXP_NO_HTTP.test(url) || URL_REGEXP_INVITE_NO_HTTP.test(url)) {
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
