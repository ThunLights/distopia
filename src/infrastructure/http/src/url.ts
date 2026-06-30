import { isLocalHostname } from "./dns";

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
    (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 CGNAT (RFC 6598)
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

export async function isHttpProtocol(url: string | URL): Promise<boolean> {
  const protocol = URL.parse(url.toString())?.protocol;

  return protocol === "http:" || protocol === "https:";
}
