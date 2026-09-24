import type { RedisClient } from "infra-redis";
import z from "zod";

export type OAuth2PKCEValue = {
  sessionKey: string;
  createdAt: Date;
};

// z.coerce.date() both revives createdAt (stored as a JSON string) into a real Date and
// rejects anything that isn't a well-formed date -- `new Date("garbage")` would otherwise
// silently produce an Invalid Date instead of failing.
const OAuth2PKCEValueSchema = z.compile(
  z.object({
    sessionKey: z.string(),
    createdAt: z.coerce.date(),
  }) satisfies z.ZodType<OAuth2PKCEValue>,
);

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
    const key = `${KEY_PREFIX}${sessionId}`;
    const raw = await this.redis.get(key);
    if (!raw) {
      return undefined;
    }
    try {
      const result = OAuth2PKCEValueSchema.safeParse(JSON.parse(raw));
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

  public async delete(sessionId: string): Promise<void> {
    await this.redis.del(`${KEY_PREFIX}${sessionId}`);
  }
}
