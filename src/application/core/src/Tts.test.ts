import type { RedisClient } from "infra-redis";
import { TtsSynthesisCache } from "repo-redis";
import { describe, expect, test, vi } from "vitest";

import type { AppState } from "./AppState";
import type { Guild } from "./Guild";
import { Tts } from "./Tts";

// Fake backed by a plain Map -- Tts (directly, or transitively via repo-redis's
// TtsSynthesisCache) only ever calls get/set/del/keys; the rest are unused stubs required to
// structurally satisfy RedisClient.
function fakeRedis(): RedisClient & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
      return "OK" as const;
    }),
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    del: vi.fn(async (key: string) => {
      const existed = store.delete(key);
      return existed ? 1 : 0;
    }),
    keys: vi.fn(async (pattern: string) => {
      const prefix = pattern.replace(/\*$/, "");
      return Array.from(store.keys()).filter((key) => key.startsWith(prefix));
    }),
    scan: vi.fn(async () => ["0", []] as [string, string[]]),
    expire: vi.fn(async () => 1),
    hset: vi.fn(async () => 1),
    hget: vi.fn(async () => null),
    hgetall: vi.fn(async () => ({})),
    hdel: vi.fn(async () => 1),
  };
}

vi.mock("infra-voicevox", async (importOriginal) => {
  const actual = await importOriginal<typeof import("infra-voicevox")>();
  return { ...actual, synthesize: vi.fn() };
});
vi.mock("infra-sakura", () => ({ synthesize: vi.fn() }));

// stripFilteredPatterns touches neither this.state nor this.guild, so casting empty objects
// is safe here -- the other methods on this class need real state/guild collaborators.
const tts = new Tts({} as AppState, {} as Guild);

describe("Tts.stripFilteredPatterns", () => {
  test("strips a bare URL when skipUrl is enabled", () => {
    const result = tts.stripFilteredPatterns("見て https://example.com/path すごい", {
      skipUrl: true,
      skipCodeBlock: true,
    });
    expect(result).not.toContain("https://example.com");
  });

  test("leaves a URL untouched when skipUrl is disabled", () => {
    const result = tts.stripFilteredPatterns("見て https://example.com/path すごい", {
      skipUrl: false,
      skipCodeBlock: true,
    });
    expect(result).toContain("https://example.com/path");
  });

  test("strips a fenced code block when skipCodeBlock is enabled", () => {
    const result = tts.stripFilteredPatterns("説明: ```const x = 1;``` 以上です", {
      skipUrl: true,
      skipCodeBlock: true,
    });
    expect(result).not.toContain("const x = 1;");
  });

  test("leaves a fenced code block untouched when skipCodeBlock is disabled", () => {
    const result = tts.stripFilteredPatterns("説明: ```const x = 1;``` 以上です", {
      skipUrl: true,
      skipCodeBlock: false,
    });
    expect(result).toContain("const x = 1;");
  });

  test("strips both a URL and a code block in the same message", () => {
    const result = tts.stripFilteredPatterns("```code``` https://example.com", {
      skipUrl: true,
      skipCodeBlock: true,
    });
    expect(result.trim()).toBe("");
  });

  test("returns plain text unchanged when nothing matches", () => {
    const result = tts.stripFilteredPatterns("ただのメッセージです", {
      skipUrl: true,
      skipCodeBlock: true,
    });
    expect(result).toBe("ただのメッセージです");
  });
});

describe("Tts.truncateForReading", () => {
  test("leaves text at or under the max length unchanged", () => {
    const text = "a".repeat(300);
    expect(tts.truncateForReading(text)).toBe(text);
  });

  test("cuts text over the max length to exactly 300 characters plus an omission note", () => {
    const text = "a".repeat(320);
    const result = tts.truncateForReading(text);
    expect(result).toBe(`${"a".repeat(300)} 以下20文字を省略`);
  });

  test("respects a custom max length", () => {
    const result = tts.truncateForReading("abcdefghij", 5);
    expect(result).toBe("abcde 以下5文字を省略");
  });

  test("leaves short text untouched", () => {
    expect(tts.truncateForReading("短いメッセージ")).toBe("短いメッセージ");
  });
});

describe("Tts.synthesize caching", () => {
  test("reuses a cached buffer instead of calling the synthesis API again", async () => {
    const { synthesize: synthesizeVoicevox } = await import("infra-voicevox");
    vi.mocked(synthesizeVoicevox).mockResolvedValue({ audio: Buffer.from("audio") });

    const state = {
      voicevoxApiKey: null,
      sakuraApiKey: null,
      memory: { ttsSynthesisCache: new TtsSynthesisCache(fakeRedis(), "bot") },
    } as unknown as AppState;
    const guild = { getSetting: vi.fn().mockResolvedValue(null) } as unknown as Guild;
    const cachedTts = new Tts(state, guild);

    const first = await cachedTts.synthesize("こんにちは", 1, "guild-1");
    const second = await cachedTts.synthesize("こんにちは", 1, "guild-1");

    expect(first).toEqual({ audio: Buffer.from("audio") });
    expect(second).toEqual({ audio: Buffer.from("audio") });
    expect(synthesizeVoicevox).toHaveBeenCalledTimes(1);
  });
});

describe("Tts voice session persistence", () => {
  test("saveVoiceSession then getAllVoiceSessions round-trips the session", async () => {
    const redis = fakeRedis();
    const state = { redis } as unknown as AppState;
    const tts = new Tts(state, {} as Guild);

    await tts.saveVoiceSession({
      guildId: "guild-1",
      voiceChannelId: "voice-1",
      textChannelId: "text-1",
    });

    expect(await tts.getAllVoiceSessions()).toEqual([
      { guildId: "guild-1", voiceChannelId: "voice-1", textChannelId: "text-1" },
    ]);
  });

  test("clearVoiceSession removes it from getAllVoiceSessions", async () => {
    const redis = fakeRedis();
    const state = { redis } as unknown as AppState;
    const tts = new Tts(state, {} as Guild);

    await tts.saveVoiceSession({
      guildId: "guild-1",
      voiceChannelId: "voice-1",
      textChannelId: "text-1",
    });
    await tts.clearVoiceSession("guild-1");

    expect(await tts.getAllVoiceSessions()).toEqual([]);
  });

  test("getAllVoiceSessions skips a corrupt entry instead of throwing", async () => {
    const redis = fakeRedis();
    redis.store.set("tts:voice-session:broken", "not json");
    const state = { redis } as unknown as AppState;
    const tts = new Tts(state, {} as Guild);

    await expect(tts.getAllVoiceSessions()).resolves.toEqual([]);
  });

  test("getAllVoiceSessions skips a wrong-shaped entry instead of returning it", async () => {
    const redis = fakeRedis();
    // Valid JSON, wrong shape -- JSON.parse alone wouldn't catch this.
    redis.store.set("tts:voice-session:wrong-shape", JSON.stringify({ guildId: "guild-1" }));
    const state = { redis } as unknown as AppState;
    const tts = new Tts(state, {} as Guild);

    await expect(tts.getAllVoiceSessions()).resolves.toEqual([]);
  });
});
