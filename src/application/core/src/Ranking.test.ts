import { describe, expect, it, vi } from "vitest";

import type { AppState } from "./AppState";
import { Ranking } from "./Ranking";

function setup() {
  const guildRanking = vi.fn(async (_type: string, num: number) =>
    Array.from({ length: Math.min(num, 2) }, (_, i) => ({ guildId: `g${i}` })),
  );
  const userRanking = vi.fn(async () => [{ userId: "u1", bumpCounter: 3 }]);
  const state = {
    database: { guildRecord: { ranking: guildRanking }, user: { ranking: userRanking } },
    discord: {
      guild: { fetch: vi.fn(async (id: string) => ({ name: `name-${id}` })) },
      user: {
        find: vi.fn(async (id: string) => ({
          id,
          name: "n",
          displayName: "d",
          globalName: null,
          avatarUrl: "a",
          bannerUrl: null,
        })),
      },
    },
  } as unknown as AppState;
  return { ranking: new Ranking(state), guildRanking, userRanking };
}

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
      (_t, num) => new Promise((r) => resolvers.push(() => r([{ guildId: `old${num}` }]))) as never,
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
