import { checkAnonymity } from "anonymous-ip";

export type VpnCheckResult =
  | { checked: true; isVpn: boolean; isProxy: boolean; isTor: boolean; provider: string | null }
  | { checked: false; error: "lookup_failed" };

export async function checkVpn(ip: string): Promise<VpnCheckResult> {
  try {
    const result = await checkAnonymity(ip);
    return {
      checked: true,
      isVpn: result.isVpn,
      isProxy: result.isProxy,
      isTor: result.isTor,
      provider: result.vpnProvider ?? result.proxyProvider ?? null,
    };
  } catch (error) {
    console.error("[aip] VPN/proxy lookup failed", error);
    return { checked: false, error: "lookup_failed" };
  }
}
