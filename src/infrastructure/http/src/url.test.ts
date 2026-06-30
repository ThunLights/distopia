import { describe, expect, test } from "vitest";

import { isLocalIPv4, isLocalIPv6, isLocalUrl } from "./url";

describe("isLocalIPv4", () => {
  test.each([
    ["0.0.0.0", "unspecified 0.0.0.0/8"],
    ["127.0.0.1", "loopback"],
    ["127.255.255.255", "loopback upper bound"],
    ["10.0.0.5", "10.0.0.0/8"],
    ["172.16.0.1", "172.16.0.0/12 lower bound"],
    ["172.31.255.255", "172.16.0.0/12 upper bound"],
    ["192.168.1.1", "192.168.0.0/16"],
    ["169.254.169.254", "169.254.0.0/16 link-local"],
    ["100.64.0.0", "100.64.0.0/10 CGNAT lower bound"],
    ["100.127.255.255", "100.64.0.0/10 CGNAT upper bound"],
    ["100.100.100.100", "100.64.0.0/10 CGNAT mid-range"],
  ])("returns true for %s (%s)", (host) => {
    expect(isLocalIPv4(host)).toBe(true);
  });

  test.each([
    ["8.8.8.8", "public"],
    ["1.1.1.1", "public"],
    ["100.63.255.255", "just below 100.64.0.0/10 CGNAT"],
    ["100.128.0.0", "just above 100.64.0.0/10 CGNAT"],
    ["172.15.0.1", "just below 172.16.0.0/12"],
    ["172.32.0.1", "just above 172.16.0.0/12"],
    ["192.169.0.1", "not 192.168"],
    ["169.255.0.1", "not 169.254"],
    ["11.0.0.1", "not 10.x"],
  ])("returns false for public address %s (%s)", (host) => {
    expect(isLocalIPv4(host)).toBe(false);
  });

  test.each([
    ["127.0.0.256", "octet > 255"],
    ["127.0.0", "too few octets"],
    ["127.0.0.1.1", "too many octets"],
    ["127.1", "shorthand is not normalized here"],
    ["127.0.0.-1", "negative octet"],
    ["127.0.0.a", "non-numeric octet"],
    ["", "empty string"],
  ])("returns false for malformed input %s (%s)", (host) => {
    expect(isLocalIPv4(host)).toBe(false);
  });
});

describe("isLocalIPv6", () => {
  test.each([
    ["::1", "loopback"],
    ["::", "unspecified"],
    ["fe80::1", "fe80::/10 link-local"],
    ["febf::1", "fe80::/10 upper bound"],
    ["fc00::1", "fc00::/7 unique-local"],
    ["fd12:3456::1", "fd unique-local"],
    ["::ffff:127.0.0.1", "IPv4-mapped (dotted)"],
    ["::ffff:7f00:1", "IPv4-mapped (hex form, as the URL parser normalizes it)"],
  ])("returns true for %s (%s)", (addr) => {
    expect(isLocalIPv6(addr)).toBe(true);
  });

  test.each([
    ["::2", "not loopback"],
    ["2001:4860:4860::8888", "public (Google DNS)"],
    ["fec0::1", "fec0 is outside fe80::/10"],
    ["fb00::1", "fb is outside fc00::/7"],
    ["fe70::1", "fe70 is outside fe80::/10"],
    ["::ffff:8.8.8.8", "IPv4-mapped public (dotted)"],
    ["::ffff:0808:0808", "IPv4-mapped public (hex 8.8.8.8)"],
  ])("returns false for %s (%s)", (addr) => {
    expect(isLocalIPv6(addr)).toBe(false);
  });
});

describe("isLocalUrl", () => {
  test.each([
    ["http://127.0.0.1/x", "loopback"],
    ["http://localhost:3000", "localhost with port"],
    ["http://sub.localhost", ".localhost subdomain"],
    ["http://2130706433", "decimal int form of 127.0.0.1"],
    ["http://0x7f000001", "hex form"],
    ["http://0177.0.0.1/admin", "octal form"],
    ["http://127.1", "shorthand form (normalized by URL parser)"],
    ["http://10.0.0.5", "10.0.0.0/8"],
    ["http://172.16.0.1", "172.16.0.0/12"],
    ["http://192.168.1.1", "192.168.0.0/16"],
    ["http://169.254.169.254/latest/meta-data", "link-local / cloud metadata"],
    ["http://0.0.0.0", "unspecified"],
    ["http://[::1]/", "IPv6 loopback"],
    ["http://[fe80::1]", "IPv6 link-local"],
    ["http://[fd00::1]", "IPv6 unique-local"],
    ["http://[::ffff:127.0.0.1]", "IPv4-mapped IPv6"],
    ["http://\\127.0.0.1\\admin", "backslash-obfuscated"],
    ["127.0.0.1:8080", "scheme-less host"],
    ["https://127.0.0.1/x", "loopback"],
    ["https://localhost:3000", "localhost with port"],
    ["https://sub.localhost", ".localhost subdomain"],
    ["https://2130706433", "decimal int form of 127.0.0.1"],
    ["https://0x7f000001", "hex form"],
    ["https://0177.0.0.1/admin", "octal form"],
    ["https://127.1", "shorthand form (normalized by URL parser)"],
    ["https://10.0.0.5", "10.0.0.0/8"],
    ["https://172.16.0.1", "172.16.0.0/12"],
    ["https://192.168.1.1", "192.168.0.0/16"],
    ["https://169.254.169.254/latest/meta-data", "link-local / cloud metadata"],
    ["https://0.0.0.0", "unspecified"],
    ["https://[::1]/", "IPv6 loopback"],
    ["https://[fe80::1]", "IPv6 link-local"],
    ["https://[fd00::1]", "IPv6 unique-local"],
    ["https://[::ffff:127.0.0.1]", "IPv4-mapped IPv6"],
    ["https://\\127.0.0.1\\admin", "backslash-obfuscated"],
  ])("returns true for %s (%s)", async (url) => {
    expect(await isLocalUrl(url)).toBe(true);
  });

  test.each([
    ["http://8.8.8.8", "public IPv4"],
    ["http://172.32.0.1", "just outside 172.16.0.0/12"],
    ["http://example.com", "public domain"],
    ["https://discord.gg/hoge", "public host"],
    ["http://[2001:4860:4860::8888]", "public IPv6"],
    ["http://256.256.256.256", "invalid octets"],
    ["not a url", "non-URL text"],
    ["", "empty string"],
  ])("returns false for %s (%s)", async (url) => {
    expect(await isLocalUrl(url)).toBe(false);
  });
});
