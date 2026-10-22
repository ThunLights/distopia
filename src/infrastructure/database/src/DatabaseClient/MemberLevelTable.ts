import type { GuildMemberLevelRow, MemberLevelStanding, UserLevelRow } from "../types/MemberLevel";
import { Base } from "./Base";

export class MemberLevelTable extends Base {
  public async findGuildRows(
    keys: { guildId: string; userId: string }[],
  ): Promise<GuildMemberLevelRow[]> {
    return await this.prisma.guildMemberLevel.findMany({ where: { OR: keys } });
  }

  public async findUserRows(userIds: string[]): Promise<UserLevelRow[]> {
    return await this.prisma.user.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, level: true, point: true },
    });
  }

  // Sorted so overlapping batches take row locks in the same order (see
  // GuildRecordTable.upsertAll for the deadlock this avoids).
  public async saveAll(guildRows: GuildMemberLevelRow[], userRows: UserLevelRow[]): Promise<void> {
    const guilds = [...guildRows].sort(
      (a, b) => a.guildId.localeCompare(b.guildId) || a.userId.localeCompare(b.userId),
    );
    const users = [...userRows].sort((a, b) => a.userId.localeCompare(b.userId));

    await this.prisma.$transaction([
      ...guilds.map((row) =>
        this.prisma.guildMemberLevel.upsert({
          where: { guildId_userId: { guildId: row.guildId, userId: row.userId } },
          update: { level: row.level, point: row.point },
          create: row,
        }),
      ),
      ...users.map((row) =>
        this.prisma.user.upsert({
          where: { userId: row.userId },
          update: { level: row.level, point: row.point },
          create: row,
        }),
      ),
    ]);
  }

  public async findGuildStanding(
    guildId: string,
    userId: string,
  ): Promise<MemberLevelStanding | null> {
    const row = await this.prisma.guildMemberLevel.findUnique({
      where: { guildId_userId: { guildId, userId } },
    });
    if (!row) {
      return null;
    }

    const higher = await this.prisma.guildMemberLevel.count({
      where: {
        guildId,
        OR: [{ level: { gt: row.level } }, { level: row.level, point: { gt: row.point } }],
      },
    });
    return { level: row.level, point: row.point, rank: higher + 1 };
  }

  public async findGlobalStanding(userId: string): Promise<MemberLevelStanding | null> {
    const row = await this.prisma.user.findUnique({ where: { userId } });
    if (!row) {
      return null;
    }

    const higher = await this.prisma.user.count({
      where: { OR: [{ level: { gt: row.level } }, { level: row.level, point: { gt: row.point } }] },
    });
    return { level: row.level, point: row.point, rank: higher + 1 };
  }
}
