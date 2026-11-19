import { useAsync } from "./async";
import { SpecialChar } from "./string";

export type FindUrls = {
  inviteLinks: string[];
  normalUrls: string[];
};

export const URL_REGEXP = /https?:\/\/[\w!?/+\-_~=;.,*&@#$%()'[\]]+/im;

export const URL_REGEXP_DISCORD_GG = /(?:(https?|discord):\/\/)?discord\.gg\/[a-zA-Z0-9_-]+/im;

// The \S runs are bounded on purpose: unbounded, they overlap each other and the literals, so a
// long space-free message (e.g. "discord.com" repeated, no "invite") backtracks polynomially and
// blocks the bot's event loop for seconds per message. The bounds still cover the obfuscated
// invite forms this regex exists to catch (see url.test.ts).
export const URL_REGEXP_DISCORD_COM =
  /(?:(https?|discord):\/\/)?\S{0,64}(?:discord\.com|discordapp\.com)\S{0,64}invite\S{0,128}[a-zA-Z0-9_-]+/im;

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
