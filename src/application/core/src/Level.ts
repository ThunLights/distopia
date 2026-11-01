import type { LevelCard } from "domain-model";
import { levelUpSync } from "domain-service";
import type { MemberLevelGain } from "infra-database/types";

import { Base } from "./Base";

export type RankCardProfile = { name: string; avatarUrl: string; guildName: string };

export type LeaderboardProfile = { name: string; avatarUrl: string };

type LeaderboardEntry = { userId: string; level: bigint; rank: number | null };

type Standing = { level: bigint; point: bigint; rank: number } | null;

const LEADERBOARD_SIZE = 10;

// Level 0 / point 0 is the DB default; levelUpSync(0, 0, 0) promotes it to the real level 1.
function toCard(standing: Standing): LevelCard {
  const { level, point } = levelUpSync(standing?.level ?? 0n, standing?.point ?? 0n, 0n);
  return { level, point, nextPoint: level ** 2n, rank: standing?.rank ?? null };
}

export class Level extends Base {
  public static messagePoint(messageLength: number): number {
    return Math.ceil(Math.sqrt(messageLength));
  }

  public static readonly VOICE_POINT = 20;

  // Known gap: read-modify-write, not atomic -- two overlapping calls for the same member can
  // drop one gain. Gains are rate-limited per member (chat) or serialized by the cron (VC), so
  // the cost is a few missed points, not corruption; same accepted-risk shape as
  // Message.increase().
  public async addAll(gains: MemberLevelGain[]): Promise<void> {
    const positive = gains.filter(({ point }) => point > 0);
    if (positive.length === 0) {
      return;
    }

    const db = this.state.database.memberLevel;
    const guildTotals = new Map<string, MemberLevelGain>();
    const userTotals = new Map<string, number>();
    for (const { guildId, userId, point } of positive) {
      const key = `${guildId}:${userId}`;
      guildTotals.set(key, { guildId, userId, point: (guildTotals.get(key)?.point ?? 0) + point });
      userTotals.set(userId, (userTotals.get(userId) ?? 0) + point);
    }

    const guildRows = new Map(
      (await db.findGuildRows([...guildTotals.values()])).map((row) => [
        `${row.guildId}:${row.userId}`,
        row,
      ]),
    );
    const userRows = new Map(
      (await db.findUserRows([...userTotals.keys()])).map((row) => [row.userId, row]),
    );

    await db.saveAll(
      [...guildTotals].map(([key, { guildId, userId, point }]) => {
        const row = guildRows.get(key);
        return {
          guildId,
          userId,
          ...levelUpSync(row?.level ?? 0n, row?.point ?? 0n, BigInt(point)),
        };
      }),
      [...userTotals].map(([userId, point]) => {
        const row = userRows.get(userId);
        return { userId, ...levelUpSync(row?.level ?? 0n, row?.point ?? 0n, BigInt(point)) };
      }),
    );
  }

  public async getCards(guildId: string, userId: string) {
    const [guild, global] = await Promise.all([
      this.state.database.memberLevel.findGuildStanding(guildId, userId),
      this.state.database.memberLevel.findGlobalStanding(userId),
    ]);
    return { guild: toCard(guild), global: toCard(global) };
  }

  // `self` is null when the user is already in `top`. Tied scores share a rank, matching
  // findGuildStanding, so /rank and the leaderboard never disagree.
  public async getLeaderboard(guildId: string, userId: string) {
    const db = this.state.database.memberLevel;
    const rows = await db.findGuildTop(guildId, LEADERBOARD_SIZE);

    const top: LeaderboardEntry[] = [];
    rows.forEach((row, index) => {
      const previous = rows[index - 1];
      const tied = previous?.level === row.level && previous.point === row.point;
      top.push({
        userId: row.userId,
        level: toCard({ ...row, rank: 0 }).level,
        rank: tied ? (top[index - 1]?.rank ?? null) : index + 1,
      });
    });

    if (rows.some((row) => row.userId === userId)) {
      return { top, self: null };
    }

    const { level, rank } = toCard(await db.findGuildStanding(guildId, userId));
    return { top, self: { userId, level, rank } satisfies LeaderboardEntry };
  }

  public async renderLeaderboard(
    guildId: string,
    userId: string,
    guildName: string,
    getProfile: (userId: string) => Promise<LeaderboardProfile>,
  ): Promise<Uint8Array> {
    const { rankCardRenderer } = this.state;
    if (rankCardRenderer === null) {
      throw new Error("rankCardRenderer is not configured");
    }

    const { top, self } = await this.getLeaderboard(guildId, userId);
    const toRow = async ({ userId: id, level, rank }: LeaderboardEntry) => ({
      ...(await getProfile(id)),
      level,
      rank,
    });

    return rankCardRenderer.renderLeaderboard({
      guildName,
      top: await Promise.all(top.map(toRow)),
      self: self && (await toRow(self)),
    });
  }

  public async renderRankCard(
    guildId: string,
    userId: string,
    profile: RankCardProfile,
  ): Promise<Uint8Array> {
    const { rankCardRenderer } = this.state;
    if (rankCardRenderer === null) {
      throw new Error("rankCardRenderer is not configured");
    }

    return rankCardRenderer.render({ ...profile, ...(await this.getCards(guildId, userId)) });
  }
}
