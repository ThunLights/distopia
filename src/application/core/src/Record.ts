import { Base } from "./Base";

export type SaveGuildInput = {
  guildId: string;
  maxlevelRank: bigint | null;
  maxRateRank: bigint | null;
  maxRate: bigint | null;
};

export class Record extends Base {
  private readonly levelRanking = new Map<string, number>();
  private readonly activeRateRanking = new Map<string, number>();

  private isNewRecord(
    guildId: string,
    record: bigint,
    recordType: "maxlevelRank" | "maxRateRank" | "maxRate",
    nowRecords: Map<string, SaveGuildInput>,
  ) {
    const nowRecord = nowRecords.get(guildId);
    if (!nowRecord) {
      return true;
    }

    if (recordType === "maxRate") {
      if (nowRecord.maxRate) {
        return nowRecord.maxRate < record;
      } else {
        return true;
      }
    } else {
      const nowRank = nowRecord[recordType];
      if (nowRank) {
        return record < nowRank;
      } else {
        return true;
      }
    }
  }

  public getLevelRank(guildId: string) {
    return this.levelRanking.get(guildId);
  }

  public getActiveRateRanking(guildId: string) {
    return this.activeRateRanking.get(guildId);
  }

  public async saveGuilds(inputs: SaveGuildInput[]) {
    const guilds = new Map(
      (await this.state.database.guildRecord.findAll()).map(
        ({ guildId, maxlevelRank, maxRateRank, maxRate }) => [
          guildId,
          { guildId, maxlevelRank, maxRateRank, maxRate },
        ],
      ),
    );

    return await this.state.database.guildRecord.upsertAll(
      inputs.map(({ guildId, maxlevelRank, maxRateRank, maxRate }) => {
        return {
          guildId,
          maxlevelRank: maxlevelRank
            ? this.isNewRecord(guildId, maxlevelRank, "maxlevelRank", guilds)
              ? maxlevelRank
              : undefined
            : undefined,
          maxRateRank: maxRateRank
            ? this.isNewRecord(guildId, maxRateRank, "maxRateRank", guilds)
              ? maxRateRank
              : undefined
            : undefined,
          maxRate: maxRate
            ? this.isNewRecord(guildId, maxRate, "maxRate", guilds)
              ? maxRate
              : undefined
            : undefined,
        };
      }),
    );
  }

  public async update() {
    const query: SaveGuildInput[] = [];
    const levelRanking = await this.state.database.guildRecord.rankingAll("level");
    const activeRateRanking = await this.state.database.guildRecord.rankingAll("activeRate");

    this.activeRateRanking.clear();
    this.levelRanking.clear();

    for (const [index, guild] of levelRanking.entries()) {
      this.levelRanking.set(guild.guildId, index + 1);
    }
    for (const [index, guild] of activeRateRanking.entries()) {
      this.activeRateRanking.set(guild.guildId, index + 1);
    }

    for (const record of await this.state.database.guildRecord.findAll()) {
      const newLevelRank = this.getLevelRank(record.guildId);
      const newActiveRateRank = this.getActiveRateRanking(record.guildId);

      query.push({
        guildId: record.guildId,
        maxlevelRank: newLevelRank ? BigInt(newLevelRank) : null,
        maxRateRank: newActiveRateRank ? BigInt(newActiveRateRank) : null,
        maxRate: record.maxRate,
      });
    }

    return await this.saveGuilds(query);
  }
}
