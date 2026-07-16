import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { GuildEdit } from "./GuildEdit";
import { GuildMemberAdd } from "./GuildMemberAdd";
import { GuildSetting } from "./GuildSetting";
import { LateLimitMapWithGC } from "./latelimit/LateLimitMapWithGC";
import { MessageCreate } from "./MessageCreate";
import { OAuth2Guilds } from "./OAuth2Guilds";
import { OAuth2PKCE } from "./OAuth2PKCE";
import { UrlCacheInMemory } from "./UrlCacheInMemory";
import { UserOAuth2 } from "./UserOAuth2";

// All GC implementations compare against Date.now(), so we use fake timers to
// make time-based cleanup fully deterministic.

const BASE_TIME = new Date("2024-06-01T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(BASE_TIME);
});

afterEach(() => {
  vi.useRealTimers();
});

// Helper to create a Date offset from BASE_TIME by the given number of milliseconds.
function at(offsetMs: number): Date {
  return new Date(BASE_TIME.getTime() + offsetMs);
}

// ── GuildEdit (2-hour TTL) ─────────────────────────────────────────────────
// Condition: nowTime > updated + 2h  (strictly greater → exactly 2h is KEPT)

describe("GuildEdit.gc()", () => {
  const TWO_HOURS = 2 * 60 * 60 * 1000;

  test("removes entries strictly older than 2 hours", () => {
    const map = new GuildEdit();
    map.set("old", { updated: at(-TWO_HOURS - 1) }); // 2h + 1ms old → deleted
    map.set("exact", { updated: at(-TWO_HOURS) }); // exactly 2h old → kept
    map.set("fresh", { updated: at(-TWO_HOURS + 1) }); // 1ms under 2h → kept

    map.gc();

    expect(map.has("old")).toBe(false);
    expect(map.has("exact")).toBe(true);
    expect(map.has("fresh")).toBe(true);
  });

  test("keeps all entries when nothing has expired", () => {
    const map = new GuildEdit();
    map.set("a", { updated: at(-30 * 60 * 1000) }); // 30 min old
    map.set("b", { updated: at(-1) }); // just now

    map.gc();

    expect(map.size).toBe(2);
  });

  test("clears all entries when all are expired", () => {
    const map = new GuildEdit();
    map.set("x", { updated: at(-TWO_HOURS - 1000) });
    map.set("y", { updated: at(-TWO_HOURS - 5000) });

    map.gc();

    expect(map.size).toBe(0);
  });

  test("empty map stays empty", () => {
    const map = new GuildEdit();
    map.gc();
    expect(map.size).toBe(0);
  });
});

// ── GuildMemberAdd (15-minute TTL) ────────────────────────────────────────
// Condition: now - 15min > updatedAt  (strictly)

describe("GuildMemberAdd.gc()", () => {
  const FIFTEEN_MIN = 15 * 60 * 1000;

  test("removes entries strictly older than 15 minutes", () => {
    const map = new GuildMemberAdd();
    map.set("old", { memberIds: [], updatedAt: at(-FIFTEEN_MIN - 1) });
    map.set("exact", { memberIds: [], updatedAt: at(-FIFTEEN_MIN) });
    map.set("fresh", { memberIds: [], updatedAt: at(-FIFTEEN_MIN + 1) });

    map.gc();

    expect(map.has("old")).toBe(false);
    expect(map.has("exact")).toBe(true);
    expect(map.has("fresh")).toBe(true);
  });
});

// ── MessageCreate (15-minute TTL) ────────────────────────────────────────
// Condition: now - 15min > updatedAt  (same as GuildMemberAdd)

describe("MessageCreate.gc()", () => {
  const FIFTEEN_MIN = 15 * 60 * 1000;

  test("removes entries strictly older than 15 minutes", () => {
    const map = new MessageCreate();
    map.set("old", { messageLens: [5], updatedAt: at(-FIFTEEN_MIN - 1) });
    map.set("fresh", { messageLens: [3], updatedAt: at(-FIFTEEN_MIN + 1) });

    map.gc();

    expect(map.has("old")).toBe(false);
    expect(map.has("fresh")).toBe(true);
  });

  test("boundary: exactly 15 min old is kept", () => {
    const map = new MessageCreate();
    map.set("boundary", { messageLens: [], updatedAt: at(-FIFTEEN_MIN) });

    map.gc();

    expect(map.has("boundary")).toBe(true);
  });
});

// ── OAuth2PKCE (20-minute TTL) ────────────────────────────────────────────
// Condition: now - 20min > createdAt  (strictly)

describe("OAuth2PKCE.gc()", () => {
  const TWENTY_MIN = 20 * 60 * 1000;

  test("removes entries strictly older than 20 minutes", () => {
    const map = new OAuth2PKCE();
    map.set("old", { sessionKey: "k1", createdAt: at(-TWENTY_MIN - 1) });
    map.set("exact", { sessionKey: "k2", createdAt: at(-TWENTY_MIN) });
    map.set("fresh", { sessionKey: "k3", createdAt: at(-TWENTY_MIN + 1) });

    map.gc();

    expect(map.has("old")).toBe(false);
    expect(map.has("exact")).toBe(true);
    expect(map.has("fresh")).toBe(true);
  });

  test("retains active PKCE sessions within the TTL", () => {
    const map = new OAuth2PKCE();
    map.set("active", { sessionKey: "s", createdAt: at(-5 * 60 * 1000) }); // 5 min old

    map.gc();

    expect(map.has("active")).toBe(true);
  });
});

// ── UserOAuth2 (10-minute TTL) ────────────────────────────────────────────
// Condition: now > updatedAt + 10min  (strictly)

describe("UserOAuth2.gc()", () => {
  const TEN_MIN = 10 * 60 * 1000;

  test("removes entries strictly older than 10 minutes", () => {
    const map = new UserOAuth2();
    map.set("old", { username: "u1", updatedAt: at(-TEN_MIN - 1) });
    map.set("exact", { username: "u2", updatedAt: at(-TEN_MIN) });
    map.set("fresh", { username: "u3", updatedAt: at(-TEN_MIN + 1) });

    map.gc();

    expect(map.has("old")).toBe(false);
    expect(map.has("exact")).toBe(true);
    expect(map.has("fresh")).toBe(true);
  });
});

// ── GuildSetting (12-hour TTL) ────────────────────────────────────────────
// Condition: now - 12h > createdAt  (strictly)

describe("GuildSetting.gc()", () => {
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;

  test("removes entries strictly older than 12 hours", () => {
    const map = new GuildSetting();
    const base = {
      actingOwner: null,
      bumpNotice: false,
      bumpNoticeRole: null,
      bumpNoticeContent: null,
      inviteLinkBlock: false,
      statChannelAllMembers: null,
      statChannelUsers: null,
      statChannelBots: null,
      statChannelActiveRate: null,
      statChannelActiveRateRanking: null,
    };

    map.set("old", { ...base, guildId: "g1", createdAt: at(-TWELVE_HOURS - 1) });
    map.set("exact", { ...base, guildId: "g2", createdAt: at(-TWELVE_HOURS) });
    map.set("fresh", { ...base, guildId: "g3", createdAt: at(-TWELVE_HOURS + 1) });

    map.gc();

    expect(map.has("old")).toBe(false);
    expect(map.has("exact")).toBe(true);
    expect(map.has("fresh")).toBe(true);
  });
});

// ── UrlCacheInMemory (12-hour TTL) ────────────────────────────────────────
// Condition: now - 12h > createdAt  (strictly)

describe("UrlCacheInMemory.gc()", () => {
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;

  test("removes stale URL cache entries strictly older than 12 hours", () => {
    const map = new UrlCacheInMemory();
    map.set("https://old.example.com", { isInviteLink: true, createdAt: at(-TWELVE_HOURS - 1) });
    map.set("https://exact.example.com", { isInviteLink: false, createdAt: at(-TWELVE_HOURS) });
    map.set("https://fresh.example.com", { isInviteLink: false, createdAt: at(-TWELVE_HOURS + 1) });

    map.gc();

    expect(map.has("https://old.example.com")).toBe(false);
    expect(map.has("https://exact.example.com")).toBe(true);
    expect(map.has("https://fresh.example.com")).toBe(true);
  });

  test("retains recently cached URLs", () => {
    const map = new UrlCacheInMemory();
    map.set("https://recent.example.com", { isInviteLink: false, createdAt: at(-60 * 1000) }); // 1 min

    map.gc();

    expect(map.size).toBe(1);
  });
});

// ── OAuth2Guilds (clears everything on gc) ────────────────────────────────

describe("OAuth2Guilds.gc()", () => {
  test("clears all entries regardless of age", () => {
    const map = new OAuth2Guilds();
    map.set("user1", []);
    map.set("user2", []);
    map.set("user3", []);

    map.gc();

    expect(map.size).toBe(0);
  });

  test("empty map stays empty after gc", () => {
    const map = new OAuth2Guilds();
    map.gc();
    expect(map.size).toBe(0);
  });
});

// ── LateLimitMapWithGC ────────────────────────────────────────────────────
// Condition: nowTime > value.getTime()  (limit date has passed, strictly)

describe("LateLimitMapWithGC.gc()", () => {
  test("removes entries whose limit date has already passed", () => {
    const map = new LateLimitMapWithGC();
    map.set("expired", at(-1)); // 1ms before now → expired
    map.gc();
    expect(map.has("expired")).toBe(false);
  });

  test("keeps entries whose limit date equals now (not strictly greater)", () => {
    const map = new LateLimitMapWithGC();
    map.set("boundary", at(0)); // exactly now → kept
    map.gc();
    expect(map.has("boundary")).toBe(true);
  });

  test("keeps entries whose limit date is in the future", () => {
    const map = new LateLimitMapWithGC();
    map.set("future", at(60_000)); // 1 minute from now
    map.gc();
    expect(map.has("future")).toBe(true);
  });

  test("removes only expired entries in a mixed map", () => {
    const map = new LateLimitMapWithGC();
    map.set("past", at(-5000)); // expired
    map.set("now", at(0)); // boundary → kept
    map.set("soon", at(1000)); // future → kept

    map.gc();

    expect(map.has("past")).toBe(false);
    expect(map.has("now")).toBe(true);
    expect(map.has("soon")).toBe(true);
  });

  test("all entries removed when all are expired", () => {
    const map = new LateLimitMapWithGC();
    map.set("a", at(-1));
    map.set("b", at(-1000));
    map.set("c", at(-99999));

    map.gc();

    expect(map.size).toBe(0);
  });
});
