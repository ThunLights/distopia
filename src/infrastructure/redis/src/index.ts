import Redis from "ioredis";

// A minimal, dependency-free interface covering only the commands this repo actually uses --
// callers depend on this shape, not ioredis's full API, so swapping clients later doesn't
// ripple outward. ioredis's real instance already satisfies it structurally.
export type RedisClient = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<"OK">;
  // Atomic set-with-expiry (SET key value EX seconds) -- one round trip instead of a
  // separate set()+expire() pair, for TTL'd caches migrated off repo-memory's Map-based gc().
  set(key: string, value: string, exToken: "EX", seconds: number): Promise<"OK">;
  // Atomic "set only if absent" with expiry (SET key value EX seconds NX) -- returns null
  // instead of "OK" when the key already exists, so a caller can use one round trip to both
  // check and acquire a rate-limit-style lock instead of a get()-then-set() pair a concurrent
  // request could race between.
  set(
    key: string,
    value: string,
    exToken: "EX",
    seconds: number,
    nxToken: "NX",
  ): Promise<"OK" | null>;
  del(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  // Cursor-based iteration -- unlike keys(), safe to use against a Redis holding a
  // meaningful number of keys (KEYS blocks the whole event loop; SCAN doesn't). Added ahead
  // of the repo-memory migration's owner-scoped boot-time reset, which needs to enumerate
  // `<owner>:*` without a KEYS-style full-keyspace block.
  scan(
    cursor: string,
    matchToken: "MATCH",
    pattern: string,
    countToken: "COUNT",
    count: number,
  ): Promise<[cursor: string, elements: string[]]>;
  expire(key: string, seconds: number): Promise<number>;
  hset(key: string, field: string, value: string): Promise<number>;
  hget(key: string, field: string): Promise<string | null>;
  hgetall(key: string): Promise<Record<string, string>>;
  hdel(key: string, field: string): Promise<number>;
};

// ioredis (not Bun's own native RedisClient) on purpose -- Bun's client only resolves under
// the real Bun runtime, but SvelteKit's Vite build partially executes the SSR bundle under
// Node.js (confirmed live: `bun run build` failed with "Cannot find package .../bun/index.js"
// once this package was wired into presentation-web's hooks.server.ts import chain). ioredis
// is a normal npm package that resolves identically under Node and Bun, so it works in both
// the Node-executed build step and the real Bun runtime production uses.
//
// lazyConnect: true -- also confirmed live: without it, that same build-time execution pass
// makes ioredis attempt a real TCP connection immediately at construction (logging a noisy
// "Unhandled error event: ECONNREFUSED" when nothing's listening), even though nothing on
// that path ever issues an actual command. Deferring the connection to the first real
// command means the build never touches the network at all.
export function createRedisClient(url: string): RedisClient {
  const client = new Redis(url, { lazyConnect: true });
  // ioredis emits "error" (rather than throwing) on every connection failure by design, so a
  // client with no listener trips Node's own "Unhandled 'error' event" crash-prone default --
  // confirmed live during a Playwright e2e run against an environment with no reachable Redis
  // (REDIS_URL unset), which logged a raw, unowned stack trace instead of this clean line.
  // Individual commands still reject normally (see RedisClient's own Promise-returning
  // methods) -- this only replaces the noisy default log, it doesn't swallow the failure.
  client.on("error", (error) => console.error("[redis] connection error", error));
  return client;
}
