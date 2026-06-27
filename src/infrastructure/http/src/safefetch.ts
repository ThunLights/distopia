import { BodySizeError } from "./Error/BodySizeError";
import { HeaderError } from "./Error/HeaderError";
import { InvalidDomainError } from "./Error/InvalidDomainError";
import { LocalAddressError } from "./Error/LocalAddressError";
import { RedirectError } from "./Error/RedirectError";
import { DEFAULT_MAX_REDIRECT } from "./redirect";
import type { SafeUrl } from "./safeurl";
import { isValidSize } from "./size";
import { DEFAULT_TIMEOUT, DISCORD_TIMEOUT } from "./timeout";
import { isHttpProtocol, isLocalUrl } from "./url";

export type SafeFetchOptions = {
  detectDiscordProtocol?: boolean;
};

export const ALLOW_DISCORD_DOMAINS = ["discord.com", "discordapp.com", "discord.gg"];

export async function safeFetchForDiscord(
  input: SafeUrl,
  init?: RequestInit,
): Promise<Response | LocalAddressError | InvalidDomainError> {
  if (await isLocalUrl(input)) return new LocalAddressError(`${input} is local address.`);
  const hostname = new URL(input).hostname;

  if (!ALLOW_DISCORD_DOMAINS.includes(hostname)) {
    return new InvalidDomainError(`${hostname} is not discord domain.`);
  }

  return await fetch(input, { ...init, signal: AbortSignal.timeout(DISCORD_TIMEOUT) });
}

export async function safeFetch(
  input: SafeUrl,
  init?: RequestInit,
  options?: SafeFetchOptions,
): Promise<Response | LocalAddressError | HeaderError | RedirectError | BodySizeError> {
  let reqUrl: string = input;
  let currentInit = init;
  let redirectCount = 0;
  let response: Response;

  while (true) {
    if (await isLocalUrl(reqUrl)) return new LocalAddressError(`${reqUrl} is local address.`);
    response = await fetch(reqUrl, {
      ...currentInit,
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
        const headers = new Headers(currentInit?.headers);
        headers.delete("authorization");
        headers.delete("cookie");
        currentInit = { ...currentInit, headers };
      }

      reqUrl = url.href;
      redirectCount += 1;
    } else {
      return response;
    }

    if (redirectCount > DEFAULT_MAX_REDIRECT) {
      return new RedirectError(`Redirect count is over ${DEFAULT_MAX_REDIRECT}`);
    }
  }
}
