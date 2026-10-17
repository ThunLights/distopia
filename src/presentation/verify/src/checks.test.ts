import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("infra-aip", () => ({ checkVpn: vi.fn() }));
vi.mock("infra-http", async (importOriginal) => ({
  ...(await importOriginal<typeof import("infra-http")>()),
  safeFetch: vi.fn(),
}));
vi.mock("./plugin", () => ({ evaluate: vi.fn() }));

import { checkVpn } from "infra-aip";
import { safeFetch } from "infra-http";

import { evaluate } from "./checks";
import * as plugin from "./plugin";

const input = {
  guildId: "1",
  userId: "2",
  extra: null,
  turnstileToken: "token",
  blockVpn: true,
  turnstileSecret: "secret",
  request: { headers: {}, ip: "203.0.113.1" },
};

const clean = {
  checked: true,
  isVpn: false,
  isProxy: false,
  isTor: false,
  provider: null,
} as const;
const turnstile = (success: boolean) => new Response(JSON.stringify({ success }), { status: 200 });

beforeEach(() => {
  vi.mocked(checkVpn).mockResolvedValue(clean);
  vi.mocked(safeFetch).mockResolvedValue(turnstile(true));
  vi.mocked(plugin.evaluate).mockResolvedValue(true);
});

describe("evaluate", () => {
  it("allows when every check passes", async () => {
    expect(await evaluate(input)).toMatchObject({ allowed: true });
  });

  it("names the VPN as the reason", async () => {
    vi.mocked(checkVpn).mockResolvedValue({ ...clean, isVpn: true, provider: "Acme" });
    expect(await evaluate(input)).toMatchObject({
      allowed: false,
      reason: "Used VPN",
      vpn: { isVpn: true, provider: "Acme" },
    });
  });

  it("refuses without an IP or when the lookup fails, only if blockVpn is set", async () => {
    expect(await evaluate({ ...input, request: { headers: {}, ip: null } })).toMatchObject({
      reason: "Could not determine IP address",
    });
    vi.mocked(checkVpn).mockResolvedValue({ checked: false, error: "lookup_failed" });
    expect(await evaluate(input)).toMatchObject({ reason: "VPN check failed" });
    expect(await evaluate({ ...input, blockVpn: false })).toMatchObject({ allowed: true });
  });

  it("names Turnstile as the reason", async () => {
    vi.mocked(safeFetch).mockResolvedValue(turnstile(false));
    expect(await evaluate(input)).toMatchObject({
      allowed: false,
      reason: "Turnstile verification failed",
    });
  });

  it("names the plugin as the reason", async () => {
    vi.mocked(plugin.evaluate).mockResolvedValue(false);
    expect(await evaluate(input)).toMatchObject({
      allowed: false,
      reason: "Rejected by verification plugin",
    });
  });
});
