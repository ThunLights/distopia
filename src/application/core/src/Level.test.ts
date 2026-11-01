import type { GuildMemberLevelRow, UserLevelRow } from "infra-database/types";
import { describe, expect, it, vi } from "vitest";

import type { AppState } from "./AppState";
import { Level } from "./Level";

type Standing = { level: bigint; point: bigint; rank: number } | null;

function levelWith(opts: {
  guild?: Standing;
  global?: Standing;
  guildRows?: GuildMemberLevelRow[];
  userRows?: UserLevelRow[];
  saved?: { guild: GuildMemberLevelRow[]; user: UserLevelRow[] };
}) {
  return new Level({
    database: {
      memberLevel: {
        findGuildStanding: async () => opts.guild ?? null,
        findGlobalStanding: async () => opts.global ?? null,
        findGuildRows: async () => opts.guildRows ?? [],
        findUserRows: async () => opts.userRows ?? [],
        saveAll: async (guild: GuildMemberLevelRow[], user: UserLevelRow[]) => {
          if (opts.saved) {
            opts.saved.guild = guild;
            opts.saved.user = user;
          }
        },
      },
    },
  } as unknown as AppState);
}

describe("Level.renderRankCard", () => {
  const profile = { name: "n", avatarUrl: "https://example.com/a.png", guildName: "g" };
  const database = {
    memberLevel: {
      findGuildStanding: async () => ({ level: 3n, point: 1n, rank: 3 }),
      findGlobalStanding: async () => null,
    },
  };

  it("hands the profile and both standings to the renderer", async () => {
    const render = vi.fn(async () => new Uint8Array([1]));
    const level = new Level({ database, rankCardRenderer: { render } } as unknown as AppState);

    expect(await level.renderRankCard("g", "u", profile)).toEqual(new Uint8Array([1]));
    expect(render).toHaveBeenCalledWith({
      ...profile,
      guild: { level: 3n, point: 1n, nextPoint: 9n, rank: 3 },
      global: { level: 1n, point: 0n, nextPoint: 1n, rank: null },
    });
  });

  it("throws when no renderer is configured", async () => {
    const level = new Level({ database, rankCardRenderer: null } as unknown as AppState);

    await expect(level.renderRankCard("g", "u", profile)).rejects.toThrow("rankCardRenderer");
  });
});

describe("Level.getLeaderboard", () => {
  const row = (userId: string, level: bigint, point = 0n): GuildMemberLevelRow => ({
    guildId: "g",
    userId,
    level,
    point,
  });
  const leaderboardWith = (rows: GuildMemberLevelRow[], standing: Standing = null) =>
    new Level({
      database: {
        memberLevel: {
          findGuildTop: async (_guildId: string, limit: number) => rows.slice(0, limit),
          findGuildStanding: async () => standing,
        },
      },
    } as unknown as AppState);

  it("has no separate entry for a user already in the top 10", async () => {
    const { top, self } = await leaderboardWith([row("a", 5n), row("u", 4n)]).getLeaderboard(
      "g",
      "u",
    );

    expect(top).toEqual([
      { userId: "a", level: 5n, rank: 1 },
      { userId: "u", level: 4n, rank: 2 },
    ]);
    expect(self).toBeNull();
  });

  it("lists only ten and adds the user outside them", async () => {
    const rows = Array.from({ length: 12 }, (_, i) => row(`m${i}`, BigInt(20 - i)));
    const { top, self } = await leaderboardWith(rows, {
      level: 3n,
      point: 0n,
      rank: 40,
    }).getLeaderboard("g", "u");

    expect(top).toHaveLength(10);
    expect(self).toEqual({ userId: "u", level: 3n, rank: 40 });
  });

  it("shows a user with no record as unranked", async () => {
    const { self } = await leaderboardWith([row("a", 5n)]).getLeaderboard("g", "u");

    expect(self).toEqual({ userId: "u", level: 1n, rank: null });
  });

  it("gives tied scores the same rank", async () => {
    const { top } = await leaderboardWith([
      row("a", 5n, 1n),
      row("b", 5n, 1n),
      row("c", 4n),
    ]).getLeaderboard("g", "a");

    expect(top.map(({ rank }) => rank)).toEqual([1, 1, 3]);
  });
});

describe("Level.renderLeaderboard", () => {
  const database = {
    memberLevel: {
      findGuildTop: async () => [{ guildId: "g", userId: "a", level: 5n, point: 0n }],
      findGuildStanding: async () => ({ level: 3n, point: 0n, rank: 40 }),
    },
  };
  const getProfile = async (userId: string) => ({ name: `n-${userId}`, avatarUrl: userId });

  it("hands resolved profiles for the top and the requester to the renderer", async () => {
    const renderLeaderboard = vi.fn(async () => new Uint8Array([1]));
    const level = new Level({
      database,
      rankCardRenderer: { renderLeaderboard },
    } as unknown as AppState);

    expect(await level.renderLeaderboard("g", "u", "guild", getProfile)).toEqual(
      new Uint8Array([1]),
    );
    expect(renderLeaderboard).toHaveBeenCalledWith({
      guildName: "guild",
      top: [{ name: "n-a", avatarUrl: "a", level: 5n, rank: 1 }],
      self: { name: "n-u", avatarUrl: "u", level: 3n, rank: 40 },
    });
  });

  it("throws when no renderer is configured", async () => {
    const level = new Level({ database, rankCardRenderer: null } as unknown as AppState);

    await expect(level.renderLeaderboard("g", "u", "guild", getProfile)).rejects.toThrow(
      "rankCardRenderer",
    );
  });
});

describe("Level", () => {
  it("scores a message as the ceiling of the square root of its length", () => {
    expect(Level.messagePoint(1)).toBe(1);
    expect(Level.messagePoint(10)).toBe(4);
    expect(Level.messagePoint(100)).toBe(10);
  });

  it("builds cards from the stored level/point, guild and global independently", async () => {
    const cards = await levelWith({
      guild: { level: 3n, point: 1n, rank: 3 },
      global: { level: 0n, point: 0n, rank: 40 },
    }).getCards("g", "u");

    expect(cards.guild).toEqual({ level: 3n, point: 1n, nextPoint: 9n, rank: 3 });
    expect(cards.global).toEqual({ level: 1n, point: 0n, nextPoint: 1n, rank: 40 });
  });

  it("shows an unranked level-1 card for a user with no record", async () => {
    const cards = await levelWith({}).getCards("g", "u");

    expect(cards.guild).toEqual({ level: 1n, point: 0n, nextPoint: 1n, rank: null });
    expect(cards.global.rank).toBeNull();
  });

  it("adds gains to the stored level/point and sums a user's gains across guilds globally", async () => {
    const saved = { guild: [] as GuildMemberLevelRow[], user: [] as UserLevelRow[] };
    await levelWith({
      guildRows: [{ guildId: "g1", userId: "u", level: 2n, point: 3n }],
      userRows: [{ userId: "u", level: 2n, point: 3n }],
      saved,
    }).addAll([
      { guildId: "g1", userId: "u", point: 1 },
      { guildId: "g2", userId: "u", point: 5 },
    ]);

    // Level 2 needs 4 points: 3 + 1 rolls over to level 3 with 0 left.
    expect(saved.guild).toContainEqual({ guildId: "g1", userId: "u", level: 3n, point: 0n });
    // A fresh row starts at level 0: 5 points reach level 1, then 2 (4 left), then 3 with 0 left.
    expect(saved.guild).toContainEqual({ guildId: "g2", userId: "u", level: 3n, point: 0n });
    // 3 + 1 + 5 = 9 points on top of level 2 (4 to level 3, 9 to level 4): level 3, 5 left.
    expect(saved.user).toEqual([{ userId: "u", level: 3n, point: 5n }]);
  });
});
