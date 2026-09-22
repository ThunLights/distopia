import type { RedisClient } from "infra-redis";

import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type ExpiringValueOptions = {
  // Opts this store into resetEphemeralMemory's boot-time wipe. Defaults to false: most
  // stores here are read-through caches (Postgres- or Discord-API-backed) where a stale
  // entry is just a cache-miss, not a correctness issue -- wiping them on every deploy would
  // only cause a thundering-herd refetch for no benefit. Only flip this on for state that
  // genuinely needs "fresh on every process start" semantics (matching the in-memory `Map`
  // these stores replaced).
  reset?: boolean;
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

  constructor(
    private readonly redis: RedisClient,
    private readonly owner: EphemeralMemoryOwner,
    private readonly store: string,
    private readonly ttlSeconds?: number,
    options?: ExpiringValueOptions,
  ) {
    this.reset = options?.reset ?? false;
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
    return JSON.parse(raw) as V;
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
    const raw = await this.redis.get(this.key(id));
    return raw === null ? undefined : this.decode(raw);
  }

  public async delete(id: string): Promise<void> {
    await this.redis.del(this.key(id));
  }
}
