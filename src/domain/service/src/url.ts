import { useAsync } from "./async";
import { SpecialChar } from "./string";

export type FindUrls = {
  inviteLinks: string[];
  normalUrls: string[];
};

export const URL_REGEXP = /https?:\/\/[\w!\?\/\+\-_~=;\.,\*&@#$%\(\)'\[\]]+/im;

export const URL_REGEXP_DISCORD_GG = /(?:https?:\/\/)?discord\.gg\/[a-zA-Z0-9_-]+/im;

export const URL_REGEXP_DISCORD_COM =
  /(?:https?:\/\/)?\S*(?:discord\.com|discordapp\.com)\S*invite\S*[a-zA-Z0-9_-]+/im;

export function isLocalIPv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;

  const [aStr, bStr, cStr, dStr] = parts;
  const a = Number(aStr);
  const b = Number(bStr);
  const c = Number(cStr);
  const d = Number(dStr);

  for (const v of [a, b, c, d]) {
    if (!Number.isInteger(v) || v < 0 || v > 255) return false;
  }

  return (
    a === 0 || // 0.0.0.0/8
    a === 127 || // 127.0.0.0/8 loop back
    a === 10 || // 10.0.0.0/8
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
    (a === 192 && b === 168) || // 192.168.0.0/16
    (a === 169 && b === 254) // 169.254.0.0/16 link local
  );
}

export function isLocalIPv6(addr: string): boolean {
  const h = addr.toLowerCase();

  if (h === "::1" || h === "::") return true; // loopback / unspecified
  if (/^fe[89ab]/.test(h)) return true; // fe80::/10 link-local
  if (/^f[cd]/.test(h)) return true; // fc00::/7 unique-local

  // IPv4-mapped: handle both ::ffff:a.b.c.d and ::ffff:7f00:1 (hex form)
  const rest = h.match(/^::ffff:(.+)$/)?.[1];

  if (rest !== undefined) {
    if (rest.includes(".")) return isLocalIPv4(rest);
    const segs = rest.split(":");
    if (segs.length === 2) {
      const hi = parseInt(segs[0] ?? "", 16);
      const lo = parseInt(segs[1] ?? "", 16);
      if (Number.isInteger(hi) && Number.isInteger(lo)) {
        return isLocalIPv4(`${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`);
      }
    }
  }

  return false;
}

export function isLocalUrl(url: string): boolean {
  let s = SpecialChar.specialChars2ASCII(url).replace(/\\/g, "/");
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = "http://" + s;

  let host: string;
  try {
    host = new URL(s).hostname.toLowerCase();
  } catch {
    return false;
  }

  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.startsWith("[") && host.endsWith("]")) return isLocalIPv6(host.slice(1, -1));
  if (/^\d/.test(host)) return isLocalIPv4(host);
  return false;
}

export function findUrlsSync(content: string): FindUrls {
  const inviteLinks: string[] = [];
  const normalUrls: string[] = [];
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
        inviteLinks.push(url);
      } else if (isUrl && !isLocalUrl(url)) {
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
