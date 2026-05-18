import { create, remove, search, upsert, upsertMultiple, getByID } from "@orama/orama";
import { stopwords as japaneseStopwords } from "@orama/stopwords/japanese";
import { createTokenizer } from "@orama/tokenizers/japanese";

import type { GuildDBValue } from "./types/GuildDBValue";
import type { SearchOptions } from "./types/SearchOptions";
import type { SearchResult } from "./types/SearchResult";

export class SearchEngine {
  private readonly guildIdToDbId = new Map<string, string>();
  private readonly guildDb = create({
    schema: {
      guildId: "string",
      name: "string",
      description: "string",
      nsfw: "boolean",
      tags: "string[]",
    },
    components: {
      tokenizer: createTokenizer({
        language: "japanese",
        stopWords: japaneseStopwords,
      }),
    },
  });

  public async upsertAll(values: GuildDBValue[]) {
    const dbIds = await upsertMultiple(this.guildDb, values);
    for (const dbId of dbIds) {
      const guild = getByID(this.guildDb, dbId);
      if (guild) {
        this.guildIdToDbId.set(guild.guildId, dbId);
      }
    }
  }

  public async upsert(value: GuildDBValue) {
    const dbId = await upsert(this.guildDb, value);
    this.guildIdToDbId.set(value.guildId, dbId);
  }

  public async delete(guildId: string) {
    const dbId = this.guildIdToDbId.get(guildId);
    if (dbId) {
      await remove(this.guildDb, dbId);
      this.guildIdToDbId.delete(dbId);
    }
  }

  public async search(term: string, options?: SearchOptions): Promise<SearchResult> {
    if (!this.guildIdToDbId.size) {
      return {
        hits: [],
        count: 0,
        time: "0ms",
      };
    }

    const nsfw = options?.filter.nsfw;
    const alg = options?.alg;
    const { hits, count, elapsed } = await search(this.guildDb, {
      term,
      properties: "*",
      where: { nsfw },
      exact: alg?.includes("exact") ?? undefined,
      preflight: alg?.includes("preflight") ?? undefined,
    });

    return {
      hits: hits.map(({ document }) => document),
      count,
      time: elapsed.formatted,
    };
  }
}
