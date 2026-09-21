import { afterEach, describe, expect, test, vi } from "vitest";

const { mockCheckAnonymity } = vi.hoisted(() => ({ mockCheckAnonymity: vi.fn() }));

vi.mock("anonymous-ip", () => ({ checkAnonymity: mockCheckAnonymity }));

import { checkVpn } from "./checkVpn";

afterEach(() => {
  vi.clearAllMocks();
});

describe("checkVpn", () => {
  test("reports a VPN match", async () => {
    mockCheckAnonymity.mockResolvedValue({
      isVpn: true,
      isProxy: false,
      isTor: false,
      vpnProvider: "NordVPN",
      proxyProvider: null,
    });

    const result = await checkVpn("185.212.170.1");

    expect(result).toEqual({
      checked: true,
      isVpn: true,
      isProxy: false,
      isTor: false,
      provider: "NordVPN",
    });
  });

  test("falls back to the proxy provider when only the proxy flag matches", async () => {
    mockCheckAnonymity.mockResolvedValue({
      isVpn: false,
      isProxy: true,
      isTor: false,
      vpnProvider: null,
      proxyProvider: "Luminati",
    });

    const result = await checkVpn("1.2.3.4");

    expect(result).toEqual({
      checked: true,
      isVpn: false,
      isProxy: true,
      isTor: false,
      provider: "Luminati",
    });
  });

  test("reports lookup_failed when the lookup throws", async () => {
    mockCheckAnonymity.mockRejectedValue(new Error("network down"));

    const result = await checkVpn("1.2.3.4");

    expect(result).toEqual({ checked: false, error: "lookup_failed" });
  });
});
