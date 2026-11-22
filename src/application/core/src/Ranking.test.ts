import { describe, expect, it, vi } from "vitest";

import type { AppState } from "./AppState";
import { Ranking } from "./Ranking";

function setup() {
  const guildRanking = vi.fn(async (_type: string) =>
    Array.from({ length: 2 }, (_, i) => ({ guildId: `g${i}` })),
  );
  const guildFetch = vi.fn(async (id: string): Promise<{ name: string } | null> => ({
    name: `name-${id}`,
  }));
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
    },
    discord: {
      guild: { fetch: guildFetch },
      user: { find: userFind },
    },
  } as unknown as AppState;
  return {
    ranking: new Ranking(state),
    guildRanking,
    guildFetch,
    userRanking,
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

describe("Ranking cache", () => {
  it("serves repeated reads from cache", async () => {
    const { ranking, guildRanking } = setup();
    await ranking.fetchGuild("level", { num: 5 });
    await ranking.fetchGuild("level", { num: 5 });
    expect(guildRanking).toHaveBeenCalledTimes(1);
  });

  it("cleanCache warms the 100-entry lists even when never read", async () => {
    const { ranking, guildRanking, userRanking } = setup();
    await ranking.cleanCache();
    expect(guildRanking).toHaveBeenCalledTimes(2);
    expect(userRanking).toHaveBeenCalledTimes(1);

    await ranking.fetchAll(100);
    expect(guildRanking).toHaveBeenCalledTimes(2);
    expect(userRanking).toHaveBeenCalledTimes(1);
  });

  it("cleanCache keeps serving the old value while rebuilding", async () => {
    const { ranking, guildRanking } = setup();
    const old = await ranking.fetchGuild("level", { num: 5 });

    let release!: () => void;
    guildRanking.mockImplementationOnce(
      () => new Promise((resolve) => (release = () => resolve([{ guildId: "new" }]))) as never,
    );
    const refreshing = ranking.cleanCache();
    expect(await ranking.fetchGuild("level", { num: 5 })).toBe(old);

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
    await vi.waitFor(() => expect(resolvers.length).toBe(3));
    const firstResolvers = resolvers.splice(0);

    guildRanking.mockImplementation(async () => [{ guildId: "newer" }]);
    await ranking.cleanCache();
    firstResolvers.forEach((r) => r(null));
    await first;

    expect((await ranking.fetchGuild("level", { num: 5 }))[0]?.guildId).toBe("newer");
  });
});
