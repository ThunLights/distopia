import { resolveHostnameToSafeIp } from "./dns";
import { BodySizeError } from "./Error/BodySizeError";
import { HeaderError } from "./Error/HeaderError";
import { InvalidDomainError } from "./Error/InvalidDomainError";
import { LocalAddressError } from "./Error/LocalAddressError";
import { RedirectError } from "./Error/RedirectError";
import { DEFAULT_MAX_REDIRECT } from "./redirect";
import type { SafeUrl } from "./safeurl";
import { isValidSize } from "./size";
import { DEFAULT_TIMEOUT, DISCORD_TIMEOUT } from "./timeout";
import { isHttpProtocol, isLocalIPv4, isLocalIPv6 } from "./url";

export type SafeFetchOptions = {
  detectDiscordProtocol?: boolean;
};

export const ALLOW_DISCORD_DOMAINS = ["discord.com", "discordapp.com", "discord.gg"];

type PinnedRequest = {
  url: string;
  init: RequestInit;
};

// Resolves a URL to a pinned IP to prevent DNS rebinding attacks.
// For hostname URLs: resolves DNS once, validates all IPs, and replaces the hostname
// with the resolved IP in the URL so fetch() never performs a second DNS lookup.
// The original Host header and TLS SNI are preserved for correct server routing.
async function resolveToPinnedUrl(
  url: string,
  init: RequestInit,
): Promise<PinnedRequest | LocalAddressError> {
  const urlObj = new URL(url);
  const { hostname, host, protocol } = urlObj;

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return new LocalAddressError(`${url} is local address.`);
  }

  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    if (isLocalIPv6(hostname.slice(1, -1))) {
      return new LocalAddressError(`${url} is local address.`);
    }
    return { url, init };
  }

  if (/^\d/.test(hostname)) {
    if (isLocalIPv4(hostname)) {
      return new LocalAddressError(`${url} is local address.`);
    }
    return { url, init };
  }

  const resolvedIp = await resolveHostnameToSafeIp(hostname);
  if (resolvedIp === null) {
    return new LocalAddressError(`${url} is local address.`);
  }

  const pinnedUrlObj = new URL(url);
  pinnedUrlObj.hostname = resolvedIp;

  const headers = new Headers(init.headers);
  headers.set("Host", host);

  const pinnedInit: RequestInit & { tls?: { serverName: string } } = {
    ...init,
    headers,
    ...(protocol === "https:" ? { tls: { serverName: hostname } } : {}),
  };

  return { url: pinnedUrlObj.href, init: pinnedInit };
}

export async function safeFetchForDiscord(
  input: SafeUrl,
  init?: RequestInit,
): Promise<Response | LocalAddressError | InvalidDomainError> {
  const hostname = new URL(input).hostname;

  if (!ALLOW_DISCORD_DOMAINS.includes(hostname)) {
    return new InvalidDomainError(`${hostname} is not discord domain.`);
  }

  const pinned = await resolveToPinnedUrl(input, init ?? {});
  if (pinned instanceof LocalAddressError) return pinned;

  return await fetch(pinned.url, { ...pinned.init, signal: AbortSignal.timeout(DISCORD_TIMEOUT) });
}

export async function safeFetch(
  input: SafeUrl,
  init?: RequestInit,
  options?: SafeFetchOptions,
): Promise<Response | LocalAddressError | HeaderError | RedirectError | BodySizeError> {
  let reqUrl: string = input;
  let currentInit: RequestInit = init ?? {};
  let redirectCount = 0;
  let response: Response;

  while (true) {
    const pinned = await resolveToPinnedUrl(reqUrl, currentInit);
    if (pinned instanceof LocalAddressError) return pinned;

    response = await fetch(pinned.url, {
      ...pinned.init,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
      redirect: "manual",
    });

    if (!(await isValidSize(response.clone()))) {
      return new BodySizeError("Body size Error");
    }

    const isRedirect = response.status >= 300 && response.status < 400 && response.status !== 304;
    const location = response.headers.get("location");

    if (isRedirect) {
      if (location === null) {
        return new HeaderError("location is not found.");
      }

      let url: URL;
      try {
        url = new URL(location, reqUrl);
      } catch {
        return new HeaderError(`${location} is invalid.`);
      }

      if (options?.detectDiscordProtocol && url.protocol === "discord://") {
        return response;
      }

      if (!(await isHttpProtocol(url))) {
        return new HeaderError(`${url.protocol} is not allowed.`);
      }

      if (new URL(reqUrl).origin !== url.origin) {
        const headers = new Headers(currentInit.headers);
        headers.delete("authorization");
        headers.delete("cookie");
        currentInit = { ...currentInit, headers };
      }

      reqUrl = url.href;
      redirectCount += 1;
    } else {
      // Expose the original hostname URL via response.url rather than the pinned IP URL,
      // so callers can perform domain-based checks (e.g. isDiscordInviteLink) correctly.
      const finalUrl = reqUrl;
      return new Proxy(response, {
        get(target, prop) {
          if (prop === "url") return finalUrl;
          // Always use target as receiver so native class private fields (#state etc.) resolve correctly.
          const value = Reflect.get(target, prop, target);
          return typeof value === "function" ? value.bind(target) : value;
        },
      }) as Response;
    }

    if (redirectCount > DEFAULT_MAX_REDIRECT) {
      return new RedirectError(`Redirect count is over ${DEFAULT_MAX_REDIRECT}`);
    }
  }
}
