import type { RedisClient } from "infra-redis";
import { expect, test, vi } from "vitest";

import { GuildSetting, type GuildSettingValue } from "./GuildSetting";

// A round-trip through set()/get() catches the schema drifting from GuildSettingValue (e.g.
// still requiring columns that moved to another table), which would turn every read into a
// silent cache miss.
test("an entry written by set() is read back by get()", async () => {
  const stored = new Map<string, string>();
  const redis = {
    set: vi.fn(async (key: string, value: string) => void stored.set(key, value)),
    get: vi.fn(async (key: string) => stored.get(key) ?? null),
  } as unknown as RedisClient;
  const store = new GuildSetting(redis, "bot");

  const value: GuildSettingValue = {
    guildId: "g",
    actingOwner: null,
    bumpNotice: false,
    bumpNoticeRole: null,
    bumpNoticeContent: null,
    inviteLinkBlock: false,
    welcomeMessageChannel: null,
    welcomeMessageContent: null,
    leaveMessageChannel: null,
    leaveMessageContent: null,
    statChannelAllMembers: null,
    statChannelUsers: null,
    statChannelBots: null,
    statChannelActiveRate: null,
    statChannelActiveRateRanking: null,
    ttsDefaultSpeakerId: null,
    ttsSkipCommand: "s",
    ttsSkipUrl: true,
    ttsSkipCodeBlock: true,
    ttsProvider: "WebVoiceVox",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  await store.set("g", value);

  expect(await store.get("g")).toEqual(value);
});
