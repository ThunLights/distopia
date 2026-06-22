import { LocalAddressError } from "./Error/LocalAddressError";
import type { SafeUrl } from "./safeurl";
import { isLocalUrl } from "./url";

export async function safeFetch(
  input: SafeUrl,
  init?: RequestInit,
): Promise<Response | LocalAddressError> {
  if (isLocalUrl(input)) return new LocalAddressError(`${input} is local address.`);

  return await fetch(input, init);
}
