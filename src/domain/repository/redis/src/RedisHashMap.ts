import type { RedisClient } from "infra-redis";

import type { ExpiringValueOptions } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

// Backs stores that need to iterate every entry in one pass (Message.syncDB's per-guild
// batch flush, VoiceChannel.update's per-guild average) -- a single Redis Hash (one key per
// owner+store, one field per guildId) instead of one string key per entry, so entries() can
// use one HGETALL instead of SCANning every individual key. No TTL on individual fields (Redis
// hashes don't support per-field expiry) -- these stores never relied on per-entry expiry
// anyway (VoiceChannelMember caps array length, not age; MessageCreate is drained by clear()
// after each sync pass), and the whole hash still gets wiped by resetEphemeralMemory's
// `<owner>:*` SCAN on every boot, same as any other key under this scheme.
//
// Per-table stores (MessageCreate, GuildMemberAdd, ...) extend this directly, baking in
// their own store name via the constructor. encode()/decode() are template-method hooks for
// values that aren't plain-JSON-safe (e.g. JWTKey's Buffer); decodeField() is the same for
// field names that aren't plain strings (e.g. JWTKey's numeric key ids, via the K parameter).
export class RedisHashMap<V, K extends string | number = string> {
  private readonly reset: boolean;

  constructor(
    private readonly redis: RedisClient,
    private readonly owner: EphemeralMemoryOwner,
    private readonly store: string,
    options?: ExpiringValueOptions,
  ) {
    this.reset = options?.reset ?? false;
  }

  private key(): string {
    return this.reset ? `${this.owner}:ephemeral:${this.store}` : `${this.owner}:${this.store}`;
  }

  protected encode(value: V): string {
    return JSON.stringify(value);
  }

  protected decode(raw: string): V {
    return JSON.parse(raw) as V;
  }

  protected decodeField(field: string): K {
    return field as K;
  }

  public async get(field: K): Promise<V | undefined> {
    const raw = await this.redis.hget(this.key(), String(field));
    return raw === null ? undefined : this.decode(raw);
  }

  public async set(field: K, value: V): Promise<void> {
    await this.redis.hset(this.key(), String(field), this.encode(value));
  }

  public async entries(): Promise<[K, V][]> {
    const all = await this.redis.hgetall(this.key());
    return Object.entries(all).map(([field, raw]) => [this.decodeField(field), this.decode(raw)]);
  }

  public async delete(field: K): Promise<void> {
    await this.redis.hdel(this.key(), String(field));
  }

  public async clear(): Promise<void> {
    await this.redis.del(this.key());
  }
}
