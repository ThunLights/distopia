import { createHash, timingSafeEqual } from "node:crypto";

import { Code, ConnectError, type Interceptor } from "@connectrpc/connect";

// Hashing both sides to a fixed-length digest first lets us use timingSafeEqual
// unconditionally -- it throws on a length mismatch, which a raw token-length
// comparison would otherwise leak.
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
