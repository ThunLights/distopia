import { describe, expect, it, vi } from "vitest";

import type { AppState } from "./AppState";
import { Ranking } from "./Ranking";
import { Record } from "./Record";

function setup() {
  const guildRanking = vi.fn(async (_type: string) =>
    Array.from({ length: 2 }, (_, i) => ({ guildId: `g${i}` })),
  );
  const guildFetch = vi.fn(async (id: string): Promise<{ name: string } | null> => ({
    name: `name-${id}`,
  }));
  const userLevelRanking = vi.fn(async () => [{ userId: "u1", level: 7n, point: 4n }]);
  const userFind = vi.fn(async (id: string): Promise<object | null> => ({
    id,
    name: "n",
    displayName: "d",
    globalName: null,
    avatarUrl: "a",
    bannerUrl: null,
  }));
  const userRanking = vi.fn(async () => [{ userId: "u1", bumpCounter: 3 }]);
  const state = {
    database: {
      guildRecord: { rankingAll: guildRanking },
      user: { ranking: userRanking },
      memberLevel: { findGlobalTop: userLevelRanking },
    },
    discord: {
      guild: { fetch: guildFetch },
      user: { find: userFind },
    },
  } as unknown as AppState;
  return {
    state,
    ranking: new Ranking(state),
    guildRanking,
    guildFetch,
    userRanking,
    userLevelRanking,
    userFind,
  };
}

describe("Ranking size", () => {
  it.each(["level", "activeRate"] as const)(
    "fills the %s ranking to 100 past guilds the bot left",
    async (type) => {
      const { ranking, guildRanking, guildFetch } = setup();
      const ids = Array.from({ length: 250 }, (_, i) => `g${i}`);
      const left = new Set(["g0", "g99", ...ids.slice(101, 200)]);
      guildRanking.mockResolvedValue(ids.map((guildId) => ({ guildId })));
      guildFetch.mockImplementation(async (id) => (left.has(id) ? null : { name: id }));

      const result = await ranking.fetchGuild(type, { num: 100 });
      expect(result.map((guild) => guild.guildId)).toEqual(
        ids.filter((id) => !left.has(id)).slice(0, 100),
      );
    },
  );

  it("returns every resolvable guild when there are fewer than requested", async () => {
    const { ranking, guildFetch } = setup();
    guildFetch.mockResolvedValueOnce(null);
    expect(await ranking.fetchGuild("level", { num: 100 })).toHaveLength(1);
  });

  it("keeps a user-level position whose Discord profile is gone", async () => {
    const { ranking, userFind } = setup();
    userFind.mockResolvedValueOnce(null);
    expect(await ranking.fetchUserLevel({ num: 100 })).toEqual([
      { id: "u1", name: "unknown", displayName: "不明なユーザー", level: 7n, point: 4n },
    ]);
  });
});

describe("Guild ranks", () => {
  it("numbers guilds exactly like the list, including past the cut", async () => {
    const { state, ranking, guildRanking, guildFetch } = setup();
    const ids = Array.from({ length: 250 }, (_, i) => `g${i}`);
    guildRanking.mockResolvedValue(ids.map((guildId) => ({ guildId })));
    guildFetch.mockImplementation(async (id) => (id === "g0" ? null : { name: id }));
    await ranking.cleanCache();

    const record = new Record(state, ranking);
    expect(record.getLevelRank("g0")).toBeUndefined();
    expect(record.getActiveRateRanking("g100")).toBe(100);
    expect(record.getLevelRank("g249")).toBe(249);
    expect((await ranking.fetchGuild("level", { num: 100 }))[99]?.guildId).toBe("g100");
  });

  it("does not overwrite best ranks when a left guild moves the displayed rank up", async () => {
    const { state, ranking, guildFetch } = setup();
    guildFetch.mockImplementation(async (id) => (id === "g0" ? null : { name: id }));
    const upsertAll = vi.fn();
    Object.assign(state.database.guildRecord, {
      findAll: async () =>
        ["g0", "g1"].map((guildId, index) => ({
          guildId,
          maxLevelRank: BigInt(index + 1),
          maxRateRank: BigInt(index + 1),
          maxRate: null,
        })),
      upsertAll,
    });
    await ranking.cleanCache();
    const record = new Record(state, ranking);
    await record.update();

    expect(record.getLevelRank("g1")).toBe(1);
    expect(upsertAll).toHaveBeenCalledWith([
      { guildId: "g0", maxLevelRank: undefined, maxRateRank: undefined, maxRate: undefined },
      { guildId: "g1", maxLevelRank: undefined, maxRateRank: undefined, maxRate: undefined },
    ]);
  });

  it("keeps the last known ranks when a refresh fails", async () => {
    const { ranking, guildRanking } = setup();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await ranking.cleanCache();
    guildRanking.mockRejectedValueOnce(new Error("boom"));
    await ranking.cleanCache();
    expect(ranking.getGuildRank("level", "g1")).toBe(2);
  });
});

describe("User bump ranking", () => {
  it("keeps a position whose Discord profile is gone", async () => {
    const { ranking, userFind } = setup();
    userFind.mockResolvedValueOnce(null);
    expect(await ranking.fetchUser("userBump", { num: 100 })).toEqual([
      { id: "u1", name: "unknown", displayName: "不明なユーザー", bumpCounter: 3 },
    ]);
  });
});

describe("Ranking failure isolation", () => {
  it("serves the other rankings when user-level lookup fails, then retries", async () => {
    const { ranking, userRanking, userFind } = setup();
    vi.spyOn(console, "error").mockImplementation(() => {});
    userRanking.mockResolvedValueOnce([]);
    userFind.mockRejectedValueOnce(new Error("bot unavailable"));

    const failed = await ranking.fetchAll(100);
    expect(failed.guild.level).toHaveLength(2);
    expect(failed.user.level).toEqual([]);
    expect((await ranking.fetchAll(100)).user.level).toHaveLength(1);
  });
});

describe("Ranking cache", () => {
  it("serves repeated reads from cache", async () => {
    const { ranking, guildRanking } = setup();
    await ranking.fetchGuild("level", { num: 5 });
    await ranking.fetchGuild("level", { num: 5 });
    expect(guildRanking).toHaveBeenCalledTimes(1);
  });

  it("cleanCache warms the 100-entry lists even when never read", async () => {
    const { ranking, guildRanking, userRanking, userLevelRanking } = setup();
    await ranking.cleanCache();
    expect(guildRanking).toHaveBeenCalledTimes(2);
    expect(userRanking).toHaveBeenCalledTimes(1);
    expect(userLevelRanking).toHaveBeenCalledTimes(1);

    await ranking.fetchAll(100);
    expect(guildRanking).toHaveBeenCalledTimes(2);
    expect(userRanking).toHaveBeenCalledTimes(1);
    expect(userLevelRanking).toHaveBeenCalledTimes(1);
  });

  it("cleanCache keeps serving the old value while rebuilding", async () => {
    const { ranking, guildRanking } = setup();
    const old = await ranking.fetchGuild("level", { num: 5 });

    let release!: () => void;
    guildRanking.mockImplementationOnce(
      () => new Promise((resolve) => (release = () => resolve([{ guildId: "new" }]))) as never,
    );
    const refreshing = ranking.cleanCache();
    expect(await ranking.fetchGuild("level", { num: 5 })).toEqual(old);

    await vi.waitFor(() => expect(release).toBeTypeOf("function"));
    release();
    await refreshing;
    expect((await ranking.fetchGuild("level", { num: 5 }))[0]?.guildId).toBe("new");
  });

  it("evicts a key whose refresh failed so the next read retries", async () => {
    const { ranking, guildRanking } = setup();
    vi.spyOn(console, "error").mockImplementation(() => {});
    await ranking.fetchGuild("level", { num: 5 });
    guildRanking.mockRejectedValueOnce(new Error("boom"));

    await expect(ranking.cleanCache()).resolves.toBeUndefined();
    const before = guildRanking.mock.calls.length;
    await ranking.fetchGuild("level", { num: 5 });
    expect(guildRanking.mock.calls.length).toBe(before + 1);
  });

  it("drops an older refresh that finishes after a newer one", async () => {
    const { ranking, guildRanking } = setup();
    await ranking.fetchGuild("level", { num: 5 });

    const resolvers: ((v: unknown) => void)[] = [];
    guildRanking.mockImplementation(
      () => new Promise((r) => resolvers.push(() => r([{ guildId: "old" }]))) as never,
    );
    const first = ranking.cleanCache();
    await vi.waitFor(() => expect(resolvers.length).toBe(2));
    const firstResolvers = resolvers.splice(0);

    guildRanking.mockImplementation(async () => [{ guildId: "newer" }]);
    await ranking.cleanCache();
    firstResolvers.forEach((r) => r(null));
    await first;

    expect((await ranking.fetchGuild("level", { num: 5 }))[0]?.guildId).toBe("newer");
  });
});
