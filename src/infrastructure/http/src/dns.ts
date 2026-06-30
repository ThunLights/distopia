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

// Resolves a hostname to a single safe (non-private) IP for direct connection.
// Returns null if any resolved IP is private/reserved or if DNS resolution fails.
// The returned IP is used to pin fetch() connections and prevent DNS rebinding.
export async function resolveHostnameToSafeIp(hostname: string): Promise<string | null> {
  const [v4, v6] = await Promise.all([
    dns.resolve4(hostname).catch(() => [] as string[]),
    dns.resolve6(hostname).catch(() => [] as string[]),
  ]);

  if (v4.some((ip) => isLocalIPv4(ip)) || v6.some((ip) => isLocalIPv6(ip))) {
    return null;
  }

  if (v4[0] !== undefined) return v4[0];
  if (v6[0] !== undefined) return v6[0];
  return null;
}
