import { count, create, remove, search, upsert, upsertMultiple } from "@orama/orama";
import { stopwords as japaneseStopwords } from "@orama/stopwords/japanese";
import { createTokenizer } from "@orama/tokenizers/japanese";

import type { GuildDBValue } from "./types/GuildDBValue";
import type { SearchOptions } from "./types/SearchOptions";
import type { SearchResult } from "./types/SearchResult";

// Orama's upsert/remove match documents by their `id`; without one it generates a random id
// per call, so re-indexing a guild silently inserted a duplicate. The guildId is unique, so
// it doubles as the document id.
function toDocument(value: GuildDBValue) {
  return { ...value, id: value.guildId };
}

export class SearchEngine {
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
    await upsertMultiple(this.guildDb, values.map(toDocument));
  }

  public async upsert(value: GuildDBValue) {
    await upsert(this.guildDb, toDocument(value));
  }

  public async delete(guildId: string) {
    await remove(this.guildDb, guildId);
  }

  public async search(term: string, options?: SearchOptions): Promise<SearchResult> {
    if (count(this.guildDb) === 0) {
      return {
        hits: [],
        count: 0,
        time: "0ms",
      };
    }

    const nsfw = options?.filter.nsfw;
    const alg = options?.alg;
    const {
      hits,
      count: hitCount,
      elapsed,
    } = await search(this.guildDb, {
      term,
      properties: "*",
      where: { nsfw },
      exact: alg?.includes("exact") ?? undefined,
      preflight: alg?.includes("preflight") ?? undefined,
    });

    return {
      hits: hits.map(({ document: { id: _id, ...guild } }) => guild),
      count: hitCount,
      time: elapsed.formatted,
    };
  }
}

// What callers outside this package (AppCore, and presentation-web's RPC client that stands
// in for it) actually use -- a plain object can satisfy this, the class itself cannot be
// implemented structurally because of its private fields.
export type SearchEngineClient = Pick<SearchEngine, "upsert" | "upsertAll" | "delete" | "search">;
