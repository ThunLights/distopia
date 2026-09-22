import type { RedisClient } from "infra-redis";

import type { ExpiringValueOptions } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

// A Redis-backed key -> expiry-Date map, TTL'd to match that Date. Generic because several
// unrelated stores share this exact shape -- rate limits (Guild.bump's RateLimitError,
// app-core's RateLimit service) and grace-period trackers (Guild.removeUnJoinedGuildData) --
// and unlike OAuth2PKCE, callers need the actual expiry Date back, not just a yes/no, so the
// stored value is the ISO date string itself rather than a createdAt to compare against a
// fixed TTL. Redis's own EX still backstops cleanup so an expired key never lingers, but the
// TTL passed to SET is derived from the caller's chosen expiry rather than a constant baked
// in here.
export class ExpiringDate {
  private readonly reset: boolean;

  constructor(
    private readonly redis: RedisClient,
    private readonly owner: EphemeralMemoryOwner,
    private readonly store: string,
    options?: ExpiringValueOptions,
  ) {
    this.reset = options?.reset ?? false;
  }

  private key(id: string): string {
    return this.reset
      ? `${this.owner}:ephemeral:${this.store}:${id}`
      : `${this.owner}:${this.store}:${id}`;
  }

  public async set(id: string, limit: Date): Promise<void> {
    const ttlSeconds = Math.max(1, Math.ceil((limit.getTime() - Date.now()) / 1000));
    await this.redis.set(this.key(id), limit.toISOString(), "EX", ttlSeconds);
  }

  public async get(id: string): Promise<Date | undefined> {
    const raw = await this.redis.get(this.key(id));
    return raw ? new Date(raw) : undefined;
  }

  public async delete(id: string): Promise<void> {
    await this.redis.del(this.key(id));
  }
}
