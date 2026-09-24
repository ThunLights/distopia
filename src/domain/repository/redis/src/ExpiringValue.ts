import type { RedisClient } from "infra-redis";
import type z from "zod";

import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

// Field-name convention this whole repo already follows (Prisma's own `@updatedAt`, see
// CLAUDE.md) -- every timestamp field here is named createdAt/updatedAt. JSON.stringify
// serializes a Date as an ISO string with no marker to tell it apart from a plain string on
// the way back in, so a bare JSON.parse (still used by encode/decode overrides that need
// non-JSON-safe types, e.g. TtsSynthesisCache's Buffer) would hand callers a string where V's
// type declares Date. This reviver re-inflates exactly those two field names, at any depth
// (JSON.parse calls the reviver bottom-up for every key), back into real Date instances.
const DATE_FIELD_NAMES = new Set(["createdAt", "updatedAt"]);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export function reviveDates(key: string, value: unknown): unknown {
  if (typeof value === "string" && DATE_FIELD_NAMES.has(key) && ISO_DATE_RE.test(value)) {
    return new Date(value);
  }
  return value;
}

export type ExpiringValueOptions<V = unknown> = {
  // Opts this store into resetEphemeralMemory's boot-time wipe. Defaults to false: most
  // stores here are read-through caches (Postgres- or Discord-API-backed) where a stale
  // entry is just a cache-miss, not a correctness issue -- wiping them on every deploy would
  // only cause a thundering-herd refetch for no benefit. Only flip this on for state that
  // genuinely needs "fresh on every process start" semantics (matching the in-memory `Map`
  // these stores replaced).
  reset?: boolean;
  // Validates every decoded value before handing it back to a caller. Guards against a
  // rolling update's old/new pod overlap (k8s/app/deployment.yaml's maxSurge: 1): if one pod
  // version writes a shape the other doesn't recognize anymore (a renamed/removed/retyped
  // field), a bare `JSON.parse` cast would hand that mismatched object straight to the
  // caller instead of failing loudly or safely. A schema failure here is logged and treated
  // as a cache miss (same as a missing key), never thrown -- consistent with every store
  // above being a read-through cache where "recompute it" is always a safe fallback.
  schema?: z.ZodType<V>;
};

// Generic JSON value cache -- Redis's own EX replaces the various repo-memory gc() sweeps
// that periodically deleted (or, for OAuth2Guilds, unconditionally cleared every
// short-interval tick) stale entries. Any `createdAt`/`updatedAt` field still present on a
// given V is now inert data (kept only for parity with existing call sites that read/write
// it), not the actual expiry mechanism -- Redis expires the whole key on its own.
//
// ttlSeconds is optional: some repo-memory sources (Friend) had no gc() at all -- entries
// lived for the life of the process. Omitting it preserves that exact "no automatic expiry"
// behavior (plain SET, no EX) rather than inventing a TTL that wasn't there before.
//
// Per-table stores (Friend, GuildSetting, ...) extend this directly, baking in their own
// store name/TTL via the constructor. encode()/decode() are template-method hooks for the
// few stores whose V isn't plain-JSON-safe (e.g. TtsSynthesisCache's Buffer) -- override
// them instead of duplicating the Redis plumbing.
export class ExpiringValue<V> {
  private readonly reset: boolean;
  private readonly schema?: z.ZodType<V>;

  constructor(
    private readonly redis: RedisClient,
    private readonly owner: EphemeralMemoryOwner,
    private readonly store: string,
    private readonly ttlSeconds?: number,
    options?: ExpiringValueOptions<V>,
  ) {
    this.reset = options?.reset ?? false;
    this.schema = options?.schema;
  }

  protected key(id: string): string {
    return this.reset
      ? `${this.owner}:ephemeral:${this.store}:${id}`
      : `${this.owner}:${this.store}:${id}`;
  }

  protected encode(value: V): string {
    return JSON.stringify(value);
  }

  protected decode(raw: string): V {
    return JSON.parse(raw, reviveDates) as V;
  }

  public async set(id: string, value: V): Promise<void> {
    const encoded = this.encode(value);
    if (this.ttlSeconds === undefined) {
      await this.redis.set(this.key(id), encoded);
    } else {
      await this.redis.set(this.key(id), encoded, "EX", this.ttlSeconds);
    }
  }

  public async get(id: string): Promise<V | undefined> {
    const key = this.key(id);
    const raw = await this.redis.get(key);
    return raw === null ? undefined : this.parse(key, raw);
  }

  public async delete(id: string): Promise<void> {
    await this.redis.del(this.key(id));
  }

  // Decode errors (malformed JSON) and schema mismatches (valid JSON, wrong shape) both land
  // here so every caller gets the same "bad entry -> cache miss" fallback, whether decode()
  // is this class's own JSON.parse or a subclass's custom override (TtsSynthesisCache's
  // Buffer handling, UserJWTVerifyKey's raw base64).
  private parse(key: string, raw: string): V | undefined {
    try {
      const decoded = this.decode(raw);
      if (!this.schema) {
        return decoded;
      }
      const result = this.schema.safeParse(decoded);
      if (!result.success) {
        console.error(`[redis] ${key} failed schema validation`, result.error);
        return undefined;
      }
      return result.data;
    } catch (error) {
      console.error(`[redis] failed to decode ${key}`, error);
      return undefined;
    }
  }
}
