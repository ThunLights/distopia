// The Connect RPC contract for the optional, private member-verification service (see
// infra-rpc's verify.proto and k8s/README.md's "Verify RPC" section). Published here so a
// private, closed-source implementation of VerifyService can depend on this package instead
// of needing access to the thunlights/distopia monorepo itself.
export {
  VerifyService,
  type RequestContext,
  type EvaluateRequest,
  type EvaluateResponse,
  type GetClientScriptRequest,
  type GetClientScriptResponse,
  type DecryptRequest,
  type DecryptResponse,
} from "$infra-rpc/gen/distopia/verify/v1/verify_pb";
export { createBearerAuthInterceptor, requireBearerAuth } from "$infra-rpc/auth";
