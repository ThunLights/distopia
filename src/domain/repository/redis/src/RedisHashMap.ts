import type { RedisClient } from "infra-redis";

import { reviveDates, type ExpiringValueOptions } from "./ExpiringValue";
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
  private readonly schema?: ExpiringValueOptions<V>["schema"];

  constructor(
    private readonly redis: RedisClient,
    private readonly owner: EphemeralMemoryOwner,
    private readonly store: string,
    options?: ExpiringValueOptions<V>,
  ) {
    this.reset = options?.reset ?? false;
    this.schema = options?.schema;
  }

  private key(): string {
    return this.reset ? `${this.owner}:ephemeral:${this.store}` : `${this.owner}:${this.store}`;
  }

  protected encode(value: V): string {
    return JSON.stringify(value);
  }

  protected decode(raw: string): V {
    return JSON.parse(raw, reviveDates) as V;
  }

  protected decodeField(field: string): K {
    return field as K;
  }

  public async get(field: K): Promise<V | undefined> {
    const raw = await this.redis.hget(this.key(), String(field));
    return raw === null ? undefined : this.parse(String(field), raw);
  }

  public async set(field: K, value: V): Promise<void> {
    await this.redis.hset(this.key(), String(field), this.encode(value));
  }

  // A malformed/mismatched field is skipped (logged, not returned) rather than failing the
  // whole entries() call -- one bad field shouldn't block every other guild's entry in the
  // same hash from coming back.
  public async entries(): Promise<[K, V][]> {
    const all = await this.redis.hgetall(this.key());
    const results: [K, V][] = [];
    for (const [field, raw] of Object.entries(all)) {
      const value = this.parse(field, raw);
      if (value !== undefined) {
        results.push([this.decodeField(field), value]);
      }
    }
    return results;
  }

  public async delete(field: K): Promise<void> {
    await this.redis.hdel(this.key(), String(field));
  }

  public async clear(): Promise<void> {
    await this.redis.del(this.key());
  }

  // See ExpiringValue.parse's own comment -- same "decode error or schema mismatch both
  // become a logged, skipped entry" contract, just per-field instead of per-key.
  private parse(field: string, raw: string): V | undefined {
    const label = `${this.key()}.${field}`;
    try {
      const decoded = this.decode(raw);
      if (!this.schema) {
        return decoded;
      }
      const result = this.schema.safeParse(decoded);
      if (!result.success) {
        console.error(`[redis] ${label} failed schema validation`, result.error);
        return undefined;
      }
      return result.data;
    } catch (error) {
      console.error(`[redis] failed to decode ${label}`, error);
      return undefined;
    }
  }
}
