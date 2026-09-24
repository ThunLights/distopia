import type { RedisClient } from "infra-redis";
import z from "zod";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

const UserJWTVerifyKeySchema = z.instanceof(Uint8Array) satisfies z.ZodType<Uint8Array>;

// Per-user JWT verify key (invalidates that user's existing tokens when rotated, see
// JWT.updateNewUserVerifyKey / routes/api/user/logout/all). No TTL: the original was a plain
// Map with no gc() at all.
export class UserJWTVerifyKey extends ExpiringValue<Uint8Array> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "userJWTVerifyKey", undefined, { schema: UserJWTVerifyKeySchema });
  }

  // Redis strings are text -- the key is stored base64-encoded directly (not JSON-wrapped)
  // since JSON.stringify on a raw Uint8Array would serialize it as an index-keyed object,
  // not bytes.
  protected override encode(value: Uint8Array): string {
    return Buffer.from(value).toString("base64");
  }

  protected override decode(raw: string): Uint8Array {
    return Buffer.from(raw, "base64");
  }
}
