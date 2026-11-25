import { count, create, remove, search, upsert } from "@orama/orama";
import { stopwords as japaneseStopwords } from "@orama/stopwords/japanese";
import { createTokenizer } from "@orama/tokenizers/japanese";

import type { GuildDBValue } from "./types/GuildDBValue";
import type { SearchOptions } from "./types/SearchOptions";
import type { SearchResult } from "./types/SearchResult";

// Orama's upsert/remove match documents by their `id`; without one it generates a random id
// per call, so re-indexing a guild silently inserted a duplicate. The guildId is unique, so
// it doubles as the document id.
// Tags are indexed as one joined string: Orama 3.1.18 corrupts a string[] field's average
// length to NaN when it removes a document with 2+ entries, which poisons every later tag
// score. The array itself is still stored (unindexed) so hits return it unchanged.
// The server tag joins tagText rather than getting its own string field: most guilds have none,
// and an indexed field left empty skews Orama's length average for every other document.
type GuildDocument = GuildDBValue & { id: string; tagText: string; hasServerTag: boolean };

function toDocument(value: GuildDBValue): GuildDocument {
  return {
    ...value,
    id: value.guildId,
    tagText: [value.serverTag ?? "", ...value.tags].join(" ").trim(),
    hasServerTag: Boolean(value.serverTag),
  };
}

export class SearchEngine {
  private readonly guildDb = create({
    schema: {
      guildId: "string",
      name: "string",
      description: "string",
      nsfw: "boolean",
      tagText: "string",
      hasServerTag: "boolean",
    },
    components: {
      tokenizer: createTokenizer({
        language: "japanese",
        stopWords: japaneseStopwords,
      }),
    },
  });

  // Not upsertMultiple: past its 1,000-document batch it defers the removals with setTimeout
  // but re-inserts right away, which throws DOCUMENT_ALREADY_EXISTS on a large re-index.
  public async upsertAll(values: GuildDBValue[]) {
    for (const value of values) {
      await upsert(this.guildDb, toDocument(value));
    }
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
    } = await search<typeof this.guildDb, GuildDocument>(this.guildDb, {
      term,
      properties: "*",
      // Orama reads a where key set to undefined as false, so only set the filters in use.
      where: {
        ...(nsfw !== undefined && { nsfw }),
        ...(options?.filter.serverTag && { hasServerTag: true }),
      },
      exact: alg?.includes("exact") ?? undefined,
      preflight: alg?.includes("preflight") ?? undefined,
    });

    return {
      hits: hits.map(
        ({ document: { id: _id, tagText: _tagText, hasServerTag: _hasServerTag, ...guild } }) =>
          guild,
      ),
      count: hitCount,
      time: elapsed.formatted,
    };
  }
}

// What callers outside this package (AppCore, and presentation-web's RPC client that stands
// in for it) actually use -- a plain object can satisfy this, the class itself cannot be
// implemented structurally because of its private fields.
export type SearchEngineClient = Pick<SearchEngine, "upsert" | "upsertAll" | "delete" | "search">;
