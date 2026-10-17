// The Connect RPC contract for the optional, private member-verification service (see
// proto/distopia/verify/v1/verify.proto and k8s/README.md's "Verify RPC" section). Generated
// and defined here (not infra-rpc) so a private, closed-source implementation of
// VerifyService can depend on this package alone -- no access to the thunlights/distopia
// monorepo needed. infra-rpc re-exports these same symbols for in-monorepo consumers
// (presentation-verify, presentation-web) instead of generating its own copy.
export {
  VerifyService,
  type RequestContext,
  type EvaluateRequest,
  type EvaluateResponse,
  type VpnResult,
  type GetClientScriptRequest,
  type GetClientScriptResponse,
  type DecryptRequest,
  type DecryptResponse,
} from "./gen/distopia/verify/v1/verify_pb";

import { createHash, timingSafeEqual } from "node:crypto";

import { Code, ConnectError, type Interceptor } from "@connectrpc/connect";

// Duplicated from infra-rpc's own auth.ts (not imported from there) for the same reason as
// the generated code above -- this package must have zero workspace dependency of its own.
function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function createBearerAuthInterceptor(token: string): Interceptor {
  return (next) => async (req) => {
    req.header.set("Authorization", `Bearer ${token}`);
    return await next(req);
  };
}

export function requireBearerAuth(token: string): Interceptor {
  const expected = digest(token);
  return (next) => async (req) => {
    const header = req.header.get("Authorization");
    const received = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
    if (!timingSafeEqual(digest(received), expected)) {
      throw new ConnectError("invalid or missing bearer token", Code.Unauthenticated);
    }
    return await next(req);
  };
}
