import { UnJoinedGuild } from "repo-redis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppState } from "./AppState";
import { Guild } from "./Guild";
import type { Ranking } from "./Ranking";
import type { Record } from "./Record";

const MINUTE = 60 * 1000;

function setup(...guildIds: string[]) {
  const keys = new Map<string, { value: string; until: number }>();
  // Honors EX: the grace period used to be broken by exactly that expiry.
  const redis = {
    set: async (key: string, value: string, _ex: string, ttl: number) => {
      keys.set(key, { value, until: Date.now() + ttl * 1000 });
      return "OK";
    },
    get: async (key: string) => {
      const entry = keys.get(key);
      return entry && Date.now() < entry.until ? entry.value : null;
    },
    del: async (key: string) => Number(keys.delete(key)),
  };
  const rows = new Set(guildIds);
  const joined = new Set(guildIds);
  const state = {
    database: {
      guild: {
        findAll: async () => [...rows].map((guildId) => ({ guildId })),
        delete: async (guildId: string) => rows.delete(guildId),
      },
    },
    discord: { guild: { isJoined: async (guildId: string) => joined.has(guildId) } },
    searchEngine: { delete: async () => {} },
    memory: { unJoinedGuild: new UnJoinedGuild(redis as never, "bot") },
  } as unknown as AppState;
  const guild = new Guild(state, {} as Record, {} as Ranking);

  async function tickFor(minutes: number) {
    for (let passed = 0; passed < minutes; passed += 20) {
      await guild.removeUnJoinedGuildData();
      vi.advanceTimersByTime(20 * MINUTE + 1500);
    }
  }

  return { rows, joined, tickFor };
}

describe("Guild.removeUnJoinedGuildData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("deletes a guild the bot left once 8 hours have passed, and not before", async () => {
    const { rows, joined, tickFor } = setup("stay", "left");
    joined.delete("left");

    await tickFor(7 * 60);
    expect(rows).toContain("left");

    await tickFor(2 * 60);
    expect([...rows]).toEqual(["stay"]);
  });

  it("restarts the grace period when the bot rejoined in between", async () => {
    const { rows, joined, tickFor } = setup("stay", "flaky");
    joined.delete("flaky");
    await tickFor(6 * 60);
    joined.add("flaky");
    await tickFor(20);
    joined.delete("flaky");
    await tickFor(6 * 60);

    expect(rows).toContain("flaky");
  });

  it("deletes nothing while the bot reports no guilds at all", async () => {
    const { rows, joined, tickFor } = setup("a", "b");
    vi.spyOn(console, "error").mockImplementation(() => {});
    joined.clear();
    await tickFor(24 * 60);

    expect([...rows]).toEqual(["a", "b"]);
  });
});
