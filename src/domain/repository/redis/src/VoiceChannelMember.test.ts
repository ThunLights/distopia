import type { RedisClient } from "infra-redis";
import { describe, expect, test, vi } from "vitest";

import { VoiceChannelMember } from "./VoiceChannelMember";

function fakeRedis(overrides: Partial<RedisClient> = {}): RedisClient {
  return {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    scan: vi.fn(),
    expire: vi.fn(),
    hset: vi.fn(),
    hget: vi.fn(),
    hgetall: vi.fn(),
    hdel: vi.fn(),
    ...overrides,
  } as RedisClient;
}

describe("VoiceChannelMember", () => {
  test("pushMemberCounts() starts a new array when nothing is stored yet", async () => {
    const hset = vi.fn().mockResolvedValue(1);
    const store = new VoiceChannelMember(
      fakeRedis({ hget: vi.fn().mockResolvedValue(null), hset }),
      "bot",
    );

    await store.pushMemberCounts("guild-1", 5);

    expect(hset).toHaveBeenCalledWith(
      "bot:voiceChannelMember",
      "guild-1",
      JSON.stringify({ memberCounts: [5] }),
    );
  });

  test("pushMemberCounts() appends to an existing array", async () => {
    const hget = vi.fn().mockResolvedValue(JSON.stringify({ memberCounts: [1, 2] }));
    const hset = vi.fn().mockResolvedValue(1);
    const store = new VoiceChannelMember(fakeRedis({ hget, hset }), "bot");

    await store.pushMemberCounts("guild-1", 3);

    expect(hset).toHaveBeenCalledWith(
      "bot:voiceChannelMember",
      "guild-1",
      JSON.stringify({ memberCounts: [1, 2, 3] }),
    );
  });

  // VoiceChannel.update() reads this buffer right after pushing this cycle's sample and
  // averages it into `plusPoint` -- if the newest sample were dropped instead of the oldest,
  // `plusPoint` would freeze at whatever the first 40 samples ever recorded averaged to.
  test("pushMemberCounts() caps at 40 samples, keeping the newest 40", async () => {
    const existing = { memberCounts: Array.from({ length: 40 }, (_, i) => i) };
    const hget = vi.fn().mockResolvedValue(JSON.stringify(existing));
    const hset = vi.fn().mockResolvedValue(1);
    const store = new VoiceChannelMember(fakeRedis({ hget, hset }), "bot");

    await store.pushMemberCounts("guild-1", 999);

    const [, , storedJson] = hset.mock.calls[0] as [string, string, string];
    const stored = JSON.parse(storedJson).memberCounts;
    expect(stored).toHaveLength(40);
    expect(stored).toContain(999);
    expect(stored).not.toContain(0);
  });

  test("entries() delegates to the underlying hash", async () => {
    const hgetall = vi.fn().mockResolvedValue({
      "guild-1": JSON.stringify({ memberCounts: [1] }),
    });
    const store = new VoiceChannelMember(fakeRedis({ hgetall }), "bot");

    expect(await store.entries()).toEqual([["guild-1", { memberCounts: [1] }]]);
  });

  test("delete() removes only the given guild's field", async () => {
    const hdel = vi.fn().mockResolvedValue(1);
    const store = new VoiceChannelMember(fakeRedis({ hdel }), "bot");

    await store.delete("guild-1");

    expect(hdel).toHaveBeenCalledWith("bot:voiceChannelMember", "guild-1");
  });
});
