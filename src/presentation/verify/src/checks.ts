import type { VerifyRequestContext } from "distopia";
import { checkVpn } from "infra-aip";
import { safeFetch, safeUrl } from "infra-http";

import * as plugin from "./plugin";

const TURNSTILE_SITEVERIFY_URL = safeUrl`https://challenges.cloudflare.com/turnstile/v0/siteverify`;

export type Vpn = { isVpn: boolean; isProxy: boolean; isTor: boolean; provider?: string };

const CLEAN_VPN: Vpn = { isVpn: false, isProxy: false, isTor: false };

export type EvaluateResult =
  | { allowed: true; vpn: Vpn }
  | { allowed: false; reason: string; vpn: Vpn };

export async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  try {
    const result = await safeFetch(TURNSTILE_SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }).toString(),
    });
    if (result instanceof Error || !result.ok) {
      return false;
    }
    const data = (await result.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// No IP, or the lookup itself failing, is a rejection rather than an allow: once a guild opts
// into blockVpn, this check failing shouldn't silently turn into a pass.
async function checkVpnBlock(ip: string | null): Promise<{ vpn: Vpn; reason: string | null }> {
  if (!ip) {
    return { vpn: CLEAN_VPN, reason: "Could not determine IP address" };
  }
  const result = await checkVpn(ip);
  if (!result.checked) {
    return { vpn: CLEAN_VPN, reason: "VPN check failed" };
  }
  const vpn: Vpn = {
    isVpn: result.isVpn,
    isProxy: result.isProxy,
    isTor: result.isTor,
    provider: result.provider ?? undefined,
  };
  const used = [result.isVpn && "VPN", result.isProxy && "Proxy", result.isTor && "Tor"].filter(
    Boolean,
  );
  return { vpn, reason: used.length > 0 ? `Used ${used.join(" / ")}` : null };
}

export async function evaluate(input: {
  guildId: string;
  userId: string;
  extra: unknown;
  turnstileToken: string;
  blockVpn: boolean;
  turnstileSecret: string;
  request: VerifyRequestContext;
}): Promise<EvaluateResult> {
  let vpn = CLEAN_VPN;
  if (input.blockVpn) {
    const check = await checkVpnBlock(input.request.ip);
    vpn = check.vpn;
    if (check.reason) {
      return { allowed: false, reason: check.reason, vpn };
    }
  }

  if (!(await verifyTurnstile(input.turnstileToken, input.turnstileSecret))) {
    return { allowed: false, reason: "Turnstile verification failed", vpn };
  }

  const allowed = await plugin.evaluate({
    guildId: input.guildId,
    userId: input.userId,
    extra: input.extra,
    request: input.request,
  });
  return allowed
    ? { allowed: true, vpn }
    : { allowed: false, reason: "Rejected by verification plugin", vpn };
}
