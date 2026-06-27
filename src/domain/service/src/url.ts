import { useAsync } from "./async";
import { SpecialChar } from "./string";

export type FindUrls = {
  inviteLinks: string[];
  normalUrls: string[];
};

export const URL_REGEXP = /https?:\/\/[\w!?/+\-_~=;.,*&@#$%()'[\]]+/im;

export const URL_REGEXP_DISCORD_GG = /(?:(https?|discord):\/\/)?discord\.gg\/[a-zA-Z0-9_-]+/im;

export const URL_REGEXP_DISCORD_COM =
  /(?:(https?|discord):\/\/)?\S*(?:discord\.com|discordapp\.com)\S*invite\S*[a-zA-Z0-9_-]+/im;

export function findUrlsSync(content: string): FindUrls {
  const inviteLinks = new Set<string>();
  const normalUrls = new Set<string>();
  const lines = content.split("\n");

  for (const line of lines) {
    const normalized = SpecialChar.specialChars2ASCII(line);

    const ALL_URL_REGEXP = new RegExp(
      [URL_REGEXP_DISCORD_GG.source, URL_REGEXP_DISCORD_COM.source, URL_REGEXP.source]
        .map((s) => `(?:${s})`)
        .join("|"),
      "gmi",
    );
    const urls = [...normalized.matchAll(ALL_URL_REGEXP)];

    for (const match of urls.filter((match) => match)) {
      const url = match[0];

      const isInviteLink =
        new RegExp(URL_REGEXP_DISCORD_GG.source, "im").test(url) ||
        new RegExp(URL_REGEXP_DISCORD_COM.source, "im").test(url);
      const isUrl = new RegExp(URL_REGEXP.source, "im").test(url);

      if (isInviteLink) {
        inviteLinks.add(url);
      } else if (isUrl) {
        normalUrls.add(url);
      }
    }
  }

  return {
    inviteLinks: Array.from(inviteLinks),
    normalUrls: Array.from(normalUrls),
  };
}

export const findUrls = useAsync(findUrlsSync);
