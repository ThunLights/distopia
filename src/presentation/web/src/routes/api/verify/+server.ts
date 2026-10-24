import { errorJson } from "#lib/server/res.js";
import { pluginHeaders, submitVerify } from "#lib/server/verifyPlugin.js";
import {
  ENCRYPTED_BODY_HEADER,
  ENCRYPTED_BODY_VALUE,
} from "#lib/shared/types/routes/api/verify.js";
import type { RequestEvent, RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

// Behind Cloudflare Tunnel the socket peer is cloudflared, so the real client IP comes from
// CF-Connecting-IPv6 (the real address when Pseudo IPv4 overwrites CF-Connecting-IP), then
// CF-Connecting-IP / CF-Pseudo-IPv4 (set by Cloudflare). Falls back to
// getClientAddress(), which can throw on some adapters/hosts -- treated as "couldn't determine".
function clientIp(e: RequestEvent): string | null {
  const cfIp =
    e.request.headers.get("cf-connecting-ipv6")?.trim() ||
    e.request.headers.get("cf-connecting-ip")?.trim() ||
    e.request.headers.get("cf-pseudo-ipv4")?.trim();
  if (cfIp) {
    return cfIp;
  }

  try {
    return e.getClientAddress();
  } catch {
    return null;
  }
}

// Only authenticates the session and relays the request: everything else about a verification
// attempt (body decryption/validation, the guild's setting, membership, Turnstile/VPN/plugin
// checks, logging, the role grant) happens in presentation-verify. Not
// authAndValidateHandler -- the body isn't always plain JSON here (see lib/client/verify.ts),
// and it is forwarded to presentation-verify as raw text.
export const POST: RequestHandler = async (e) => {
  const { user } = e.locals;
  if (!user) {
    return errorJson("Invalid User");
  }

  const result = await submitVerify({
    userId: user.id,
    body: await e.request.text(),
    encrypted: e.request.headers.get(ENCRYPTED_BODY_HEADER) === ENCRYPTED_BODY_VALUE,
    headers: pluginHeaders(e.request.headers),
    ip: clientIp(e),
  });

  return result.ok ? json({ content: "ok" }) : errorJson(result.error);
};
