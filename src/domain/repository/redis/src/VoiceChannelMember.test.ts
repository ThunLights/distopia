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
      "bot:ephemeral:voiceChannelMember",
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
      "bot:ephemeral:voiceChannelMember",
      "guild-1",
      JSON.stringify({ memberCounts: [1, 2, 3] }),
    );
  });

  test("pushMemberCounts() caps at 40 samples, keeping the first 40", async () => {
    const existing = { memberCounts: Array.from({ length: 40 }, (_, i) => i) };
    const hget = vi.fn().mockResolvedValue(JSON.stringify(existing));
    const hset = vi.fn().mockResolvedValue(1);
    const store = new VoiceChannelMember(fakeRedis({ hget, hset }), "bot");

    await store.pushMemberCounts("guild-1", 999);

    const [, , storedJson] = hset.mock.calls[0] as [string, string, string];
    expect(JSON.parse(storedJson).memberCounts).toEqual(existing.memberCounts);
    expect(JSON.parse(storedJson).memberCounts).not.toContain(999);
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

    expect(hdel).toHaveBeenCalledWith("bot:ephemeral:voiceChannelMember", "guild-1");
  });
});
