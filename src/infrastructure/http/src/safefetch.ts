import { InvalidDomainError } from "./Error/InvalidDomainError";
import { LocalAddressError } from "./Error/LocalAddressError";
import type { SafeUrl } from "./safeurl";
import { DEFAULT_TIMEOUT, DISCORD_TIMEOUT } from "./timeout";
import { isLocalUrl } from "./url";

export const DISCORD_DOMAINS = ["discord.com", "discordapp.com", "discord.gg"];

export async function safeFetchForDiscord(
  input: SafeUrl,
  init?: RequestInit,
): Promise<Response | LocalAddressError | InvalidDomainError> {
  if (isLocalUrl(input)) return new LocalAddressError(`${input} is local address.`);
  const hostname = new URL(input).hostname;

  if (!DISCORD_DOMAINS.includes(hostname)) {
    return new InvalidDomainError(`${hostname} is not discord domain.`);
  }

  return await fetch(input, { ...init, signal: DISCORD_TIMEOUT });
}

export async function safeFetch(
  input: SafeUrl,
  init?: RequestInit,
): Promise<Response | LocalAddressError> {
  if (isLocalUrl(input)) return new LocalAddressError(`${input} is local address.`);

  return await fetch(input, { ...init, signal: DEFAULT_TIMEOUT });
}
