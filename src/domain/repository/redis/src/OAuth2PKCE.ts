import type { RedisClient } from "infra-redis";

export type OAuth2PKCEValue = {
  sessionKey: string;
  createdAt: Date;
};

// "ephemeral:" makes this reachable by resetEphemeralMemory's <owner>:ephemeral:* SCAN (see
// ExpiringValueOptions.reset) -- a stray PKCE session id from before a deploy should never
// authenticate a later /auth callback.
const KEY_PREFIX = "web:ephemeral:oauth2pkce:";
// Matches repo-memory's old OAuth2PKCE.gc() cutoff -- Redis's own EXPIRE replaces that
// manual sweep, so the TTL lives here now instead of a periodic gc() pass.
const TTL_SECONDS = 20 * 60;

export class OAuth2PKCE {
  constructor(private readonly redis: RedisClient) {}

  public async set(sessionId: string, value: OAuth2PKCEValue): Promise<void> {
    await this.redis.set(`${KEY_PREFIX}${sessionId}`, JSON.stringify(value), "EX", TTL_SECONDS);
  }

  public async get(sessionId: string): Promise<OAuth2PKCEValue | undefined> {
    const raw = await this.redis.get(`${KEY_PREFIX}${sessionId}`);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as OAuth2PKCEValue;
    return { ...parsed, createdAt: new Date(parsed.createdAt) };
  }

  public async delete(sessionId: string): Promise<void> {
    await this.redis.del(`${KEY_PREFIX}${sessionId}`);
  }
}
