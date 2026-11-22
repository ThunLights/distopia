import type { AppState } from "./AppState";
import { Base } from "./Base";
import type { Ranking } from "./Ranking";

export type SaveGuildInput = {
  guildId: string;
  maxLevelRank: bigint | null;
  maxRateRank: bigint | null;
  maxRate: bigint | null;
};

function numberGuilds(guilds: { guildId: string }[]) {
  return new Map(guilds.map(({ guildId }, index) => [guildId, index + 1]));
}

export class Record extends Base {
  constructor(
    state: AppState,
    private readonly ranking: Ranking,
  ) {
    super(state);
  }

  private isNewRecord(
    guildId: string,
    record: bigint,
    recordType: "maxLevelRank" | "maxRateRank" | "maxRate",
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
    return this.ranking.getGuildRank("level", guildId);
  }

  public getActiveRateRanking(guildId: string) {
    return this.ranking.getGuildRank("activeRate", guildId);
  }

  public async saveGuilds(inputs: SaveGuildInput[]) {
    const guilds = new Map(
      (await this.state.database.guildRecord.findAll()).map(
        ({ guildId, maxLevelRank, maxRateRank, maxRate }) => [
          guildId,
          { guildId, maxLevelRank, maxRateRank, maxRate },
        ],
      ),
    );

    return await this.state.database.guildRecord.upsertAll(
      inputs.map(({ guildId, maxLevelRank, maxRateRank, maxRate }) => {
        return {
          guildId,
          maxLevelRank: maxLevelRank
            ? this.isNewRecord(guildId, maxLevelRank, "maxLevelRank", guilds)
              ? maxLevelRank
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
    // Deliberately not getLevelRank/getActiveRateRanking: those skip guilds the bot left, and
    // saving them would overwrite every stored best with a rank counted on a different basis.
    const levelRanks = numberGuilds(await this.state.database.guildRecord.rankingAll("level"));
    const activeRateRanks = numberGuilds(
      await this.state.database.guildRecord.rankingAll("activeRate"),
    );

    for (const record of await this.state.database.guildRecord.findAll()) {
      const newLevelRank = levelRanks.get(record.guildId);
      const newActiveRateRank = activeRateRanks.get(record.guildId);

      query.push({
        guildId: record.guildId,
        maxLevelRank: newLevelRank ? BigInt(newLevelRank) : null,
        maxRateRank: newActiveRateRank ? BigInt(newActiveRateRank) : null,
        maxRate: record.maxRate,
      });
    }

    return await this.saveGuilds(query);
  }
}
