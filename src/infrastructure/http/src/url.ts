import { isLocalHostname } from "./dns";

/**
 * Returns true if `host` is an IPv4 literal in a private/reserved range
 * (unspecified, loopback, RFC 1918, CGNAT, link-local, IETF/documentation/benchmarking,
 * multicast, reserved, broadcast). Non-IPv4 input returns false.
 */
export function isLocalIPv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;

  const [a, b, c, d] = parts.map(Number) as [number, number, number, number];

  for (const v of [a, b, c, d]) {
    if (!Number.isInteger(v) || v < 0 || v > 255) return false;
  }

  return (
    a === 0 || // 0.0.0.0/8
    a === 127 || // 127.0.0.0/8 loopback
    a === 10 || // 10.0.0.0/8
    (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 CGNAT (RFC 6598)
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
    (a === 192 && b === 168) || // 192.168.0.0/16
    (a === 169 && b === 254) || // 169.254.0.0/16 link local
    (a === 192 && b === 0 && (c === 0 || c === 2)) || // 192.0.0.0/24 IETF, 192.0.2.0/24 TEST-NET-1
    (a === 198 && (b === 18 || b === 19)) || // 198.18.0.0/15 benchmarking
    (a === 198 && b === 51 && c === 100) || // 198.51.100.0/24 TEST-NET-2
    (a === 203 && b === 0 && c === 113) || // 203.0.113.0/24 TEST-NET-3
    a >= 224 // 224.0.0.0/4 multicast, 240.0.0.0/4 reserved, 255.255.255.255 broadcast
  );
}

// Expands an IPv6 literal (optionally with a trailing dotted IPv4) into its eight 16-bit groups,
// or null if it's malformed.
function expandIPv6(addr: string): number[] | null {
  let h = addr.toLowerCase().split("%")[0] ?? "";

  const dotted = h.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) {
    const octets = (dotted[2] ?? "").split(".").map(Number);
    if (octets.some((o) => !Number.isInteger(o) || o > 255)) return null;
    const [o1 = 0, o2 = 0, o3 = 0, o4 = 0] = octets;
    h = `${dotted[1]}${((o1 << 8) | o2).toString(16)}:${((o3 << 8) | o4).toString(16)}`;
  }

  const halves = h.split("::");
  if (halves.length > 2) return null;

  const split = (s: string | undefined) => (s ? s.split(":") : []);
  const head = split(halves[0]);
  const tail = split(halves[1]);
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;

  const groups = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (!groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.map((g) => parseInt(g, 16));
}

/**
 * Returns true if `addr` is an IPv6 literal in a private/reserved range, or one that embeds an
 * IPv4 address (IPv4-compatible/-mapped/-translated, NAT64, 6to4) whose IPv4 is private.
 * Malformed input fails closed (returns true).
 */
export function isLocalIPv6(addr: string): boolean {
  const groups = expandIPv6(addr);
  if (!groups) return true;

  const [g0 = 0, g1 = 0, g2 = 0, g3 = 0, g4 = 0, g5 = 0, g6 = 0, g7 = 0] = groups;
  const embeddedV4 = (hi: number, lo: number) =>
    isLocalIPv4(`${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`);

  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0) {
    // ::/96 IPv4-compatible (incl. :: and ::1), ::ffff:0:0/96 mapped, ::ffff:0:0:0/96 translated
    if ((g4 === 0 && (g5 === 0 || g5 === 0xffff)) || (g4 === 0xffff && g5 === 0)) {
      return embeddedV4(g6, g7);
    }
    return true; // rest of ::/64 is reserved
  }
  if (g0 === 0x64 && g1 === 0xff9b) {
    // 64:ff9b::/96 well-known NAT64 embeds an IPv4; 64:ff9b:1::/48 is local-use NAT64
    return g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0 ? embeddedV4(g6, g7) : true;
  }
  if (g0 === 0x2002) return embeddedV4(g1, g2); // 2002::/16 6to4
  if (g0 === 0x2001 && (g1 === 0 || g1 === 0xdb8)) return true; // Teredo, documentation

  return (
    (g0 & 0xffc0) === 0xfe80 || // fe80::/10 link-local
    (g0 & 0xffc0) === 0xfec0 || // fec0::/10 deprecated site-local
    (g0 & 0xfe00) === 0xfc00 || // fc00::/7 unique-local
    (g0 & 0xff00) === 0xff00 // ff00::/8 multicast
  );
}

/**
 * Returns true if `url` (with or without a scheme) resolves to a
 * local/private address — `localhost`, a private IPv4/IPv6 literal, or a
 * hostname whose DNS records are all private.
 *
 * @example
 * await isLocalUrl("http://169.254.169.254/"); // true — link-local
 */
export async function isLocalUrl(url: string): Promise<boolean> {
  let s = url.replace(/\\/g, "/");
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = "http://" + s;

  const hostname = URL.parse(s)?.hostname.toLowerCase();
  if (hostname === undefined) return false;

  if (hostname === "localhost" || hostname.endsWith(".localhost")) return true;
  if (hostname.startsWith("[") && hostname.endsWith("]")) return isLocalIPv6(hostname.slice(1, -1));
  if (/^\d/.test(hostname)) return isLocalIPv4(hostname);

  return await isLocalHostname(hostname);
}

/** Returns true if `url` parses with an `http:` or `https:` protocol. */
export async function isHttpProtocol(url: string | URL): Promise<boolean> {
  const protocol = URL.parse(url.toString())?.protocol;

  return protocol === "http:" || protocol === "https:";
}
