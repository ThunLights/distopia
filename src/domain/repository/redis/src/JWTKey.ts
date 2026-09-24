import type { RedisClient } from "infra-redis";
import z from "zod";

import { RedisHashMap } from "./RedisHashMap";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type JWTKeyValue = {
  alg: "HS256";
  key: Buffer;
  createdAt: Date;
};

const JWTKeyValueSchema = z.object({
  alg: z.literal("HS256"),
  key: z.instanceof(Buffer),
  createdAt: z.date(),
}) satisfies z.ZodType<JWTKeyValue>;

type EncodedJWTKeyValue = {
  alg: "HS256";
  key: string;
  createdAt: string;
};

// JWT signing keys -- a Redis Hash (one field per key id) so getCurrKey()/findJwtKeyAll() can
// still iterate every key in one HGETALL, same as the old Map.entries(). No TTL: the
// original was a plain Map with no gc() at all (JWT.update() is the only thing that ever
// deletes a key, via its own 365-day check), so an automatic Redis expiry would be new,
// unintended behavior for security-sensitive signing material.
export class JWTKey extends RedisHashMap<JWTKeyValue, number> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "jwtKey", { schema: JWTKeyValueSchema });
  }

  // Redis strings are text -- the signing key is stored base64-encoded rather than
  // JSON.stringify'd directly (which would serialize a Buffer as
  // {"type":"Buffer","data":[...]}, not what JSON.parse hands back without a custom reviver).
  protected override encode(value: JWTKeyValue): string {
    return JSON.stringify({
      alg: value.alg,
      key: value.key.toString("base64"),
      createdAt: value.createdAt.toISOString(),
    } satisfies EncodedJWTKeyValue);
  }

  protected override decode(raw: string): JWTKeyValue {
    const parsed = JSON.parse(raw) as EncodedJWTKeyValue;
    return {
      alg: parsed.alg,
      key: Buffer.from(parsed.key, "base64"),
      createdAt: new Date(parsed.createdAt),
    };
  }

  protected override decodeField(field: string): number {
    return Number(field);
  }
}
