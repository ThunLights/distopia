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

/** Options for {@link safeFetch}. */
export type SafeFetchOptions = {
  /**
   * When true, a redirect to a `discord://` URL is returned as-is instead
   * of being rejected as a non-http(s) redirect target, so callers can
   * detect Discord deep-link redirects (e.g. invite link resolution).
   */
  detectDiscordProtocol?: boolean;
};

export const ALLOW_DISCORD_DOMAINS = ["discord.com", "discordapp.com", "discord.gg"];

type PinnedRequest = {
  url: string;
  init: RequestInit;
};

// Resolves the hostname to a pinned IP up front (fetch() never re-resolves DNS, closing
// the rebinding window) while preserving the original Host header and TLS SNI so the
// pinned request still routes to the right virtual host.
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
  // URL.hostname requires IPv6 literals to be wrapped in brackets;
  // assigning a raw IPv6 like "2001:db8::1" is silently ignored.
  pinnedUrlObj.hostname = resolvedIp.includes(":") ? `[${resolvedIp}]` : resolvedIp;

  const headers = new Headers(init.headers);
  headers.set("Host", host);

  const pinnedInit: RequestInit & { tls?: { serverName: string } } = {
    ...init,
    headers,
    ...(protocol === "https:" ? { tls: { serverName: hostname } } : {}),
  };

  return { url: pinnedUrlObj.href, init: pinnedInit };
}

/**
 * Fetches a URL restricted to Discord's own domains (`discord.com`,
 * `discordapp.com`, `discord.gg`), with DNS-pinned SSRF protection.
 * Redirects are not followed — the response is returned as-is with
 * `redirect: "manual"`.
 *
 * @param input - A {@link SafeUrl} whose hostname must be a Discord domain.
 * @param init - Standard `fetch` options; the `Host` header and TLS SNI
 * are preserved automatically after IP pinning.
 * @returns The `Response`, or:
 * - {@link InvalidDomainError} if the hostname isn't an allowed Discord domain.
 * - {@link LocalAddressError} if the hostname resolves to a private/local IP.
 *
 * @example
 * const res = await safeFetchForDiscord(safeUrl`https://discord.com/api/...`);
 * if (res instanceof Error) return;
 */
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

  return await fetch(pinned.url, {
    ...pinned.init,
    signal: AbortSignal.timeout(DISCORD_TIMEOUT),
    redirect: "manual",
  });
}

/**
 * SSRF-safe `fetch` wrapper: resolves and pins DNS before connecting,
 * rejects private/local IPs, caps the response body size, and follows
 * redirects manually — stripping `Authorization`/`Cookie` on cross-origin
 * hops — up to {@link DEFAULT_MAX_REDIRECT} hops.
 *
 * @param input - A {@link SafeUrl} to fetch.
 * @param init - Standard `fetch` options.
 * @param options - See {@link SafeFetchOptions}.
 * @returns The final `Response` — its `.url` reflects the original
 * hostname, not the pinned IP — or:
 * - {@link LocalAddressError} if any hop resolves to a private/local IP.
 * - {@link HeaderError} if a redirect response is missing its `Location`
 *   header, the header isn't a parseable URL, or the redirect target isn't
 *   an http(s) URL.
 * - {@link RedirectError} if the redirect chain exceeds {@link DEFAULT_MAX_REDIRECT}.
 * - {@link BodySizeError} if the response body exceeds the size limit.
 *
 * @example
 * const res = await safeFetch(safeUrl`https://example.com/${path}`);
 * if (res instanceof Error) return;
 * const text = await res.text();
 */
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
