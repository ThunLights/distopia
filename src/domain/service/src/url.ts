import { useAsync } from "./async";
import { SpecialChar } from "./string";

export type FindUrls = {
  inviteLinks: string[];
  normalUrls: string[];
};

export const URL_REGEXP = /^https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+$/gim;

export const URL_REGEXP_NO_HTTP = /(?:https?:\/\/)?(?:discord).*gg.*([a-zA-Z0-9_-]+)/gim;

export const URL_REGEXP_INVITE_NO_HTTP =
  /(?:https?:\/\/)?(?:discord)\.(?:[a-z]{2,6})\/?.*invite.*([a-zA-Z0-9_-]+)\b|(?:https?:\/\/)?(?:discordapp)\.(?:[a-z]{2,6})\/?.*invite.*([a-zA-Z0-9_-]+)/gim;

export const regExp = new RegExp(
  URL_REGEXP.source + URL_REGEXP_NO_HTTP.source + URL_REGEXP_INVITE_NO_HTTP.source,
  "gmi",
);

export function findUrlsSync(content: string): FindUrls {
  const result: FindUrls = {
    inviteLinks: [],
    normalUrls: [],
  };
  const lines = content.split("\n");

  for (const line of lines) {
    const urls = line.split(regExp);
    for (const url of urls.map((value) => SpecialChar.specialChars2ASCII(value))) {
      if (URL_REGEXP_NO_HTTP.test(url) || URL_REGEXP_INVITE_NO_HTTP.test(url)) {
        result.inviteLinks.push(url);
        continue;
      }
      if (URL_REGEXP.test(url)) {
        result.normalUrls.push(url);
        continue;
      }
    }
  }

  return result;
}

export const findUrls = useAsync(findUrlsSync);
