import { promises as dns } from "node:dns";

import { isLocalIPv4, isLocalIPv6 } from "./url";

// Resolves all A and AAAA records for a hostname and returns true if any
// resolved IP falls within a private/reserved range.
export async function isLocalHostname(hostname: string): Promise<boolean> {
  const [v4, v6] = await Promise.all([
    dns.resolve4(hostname).catch(() => [] as string[]),
    dns.resolve6(hostname).catch(() => [] as string[]),
  ]);

  return v4.some((ip) => isLocalIPv4(ip)) || v6.some((ip) => isLocalIPv6(ip));
}
