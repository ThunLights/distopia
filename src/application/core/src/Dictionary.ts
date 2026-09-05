import type {
  GuildDictionary,
  GuildDictionaryUpsertInput,
  UserDictionary,
  UserDictionaryUpsertInput,
} from "infra-database/types";
import { safeFetch, validateSafeUrl } from "infra-http";
import { parse as parseToml, stringify as stringifyToml } from "smol-toml";
import z from "zod";

import { Base } from "./Base";

const DictionaryRecordSchema = z.record(z.string(), z.string());

export type DictionaryExportFormat = "json" | "toml";
export type DictionaryImportMode = "merge" | "replace";
export type DictionaryImportError = "fetch_failed" | "invalid_format";

export class Dictionary extends Base {
  public async getUserEntries(userId: string): Promise<UserDictionary[]> {
    const cached = this.state.memory.userDictionary.get(userId);
    if (cached) {
      return cached.entries;
    }

    const entries = await this.state.database.userDictionary.findAll(userId);
    this.state.memory.userDictionary.set(userId, { entries, createdAt: new Date() });
    return entries;
  }

  public async getGuildEntries(guildId: string): Promise<GuildDictionary[]> {
    const cached = this.state.memory.guildDictionary.get(guildId);
    if (cached) {
      return cached.entries;
    }

    const entries = await this.state.database.guildDictionary.findAll(guildId);
    this.state.memory.guildDictionary.set(guildId, { entries, createdAt: new Date() });
    return entries;
  }

  public async addUserEntry(input: UserDictionaryUpsertInput): Promise<UserDictionary> {
    const entry = await this.state.database.userDictionary.upsert(input);
    this.state.memory.userDictionary.delete(input.userId);
    return entry;
  }

  public async removeUserEntry(userId: string, word: string): Promise<UserDictionary> {
    const entry = await this.state.database.userDictionary.delete(userId, word);
    this.state.memory.userDictionary.delete(userId);
    return entry;
  }

  public async addGuildEntry(input: GuildDictionaryUpsertInput): Promise<GuildDictionary> {
    const entry = await this.state.database.guildDictionary.upsert(input);
    this.state.memory.guildDictionary.delete(input.guildId);
    return entry;
  }

  public async removeGuildEntry(guildId: string, word: string): Promise<GuildDictionary> {
    const entry = await this.state.database.guildDictionary.delete(guildId, word);
    this.state.memory.guildDictionary.delete(guildId);
    return entry;
  }

  // Personal entries take precedence over the guild dictionary for the same word.
  public async resolve(guildId: string, userId: string): Promise<Map<string, string>> {
    const [guildEntries, userEntries] = await Promise.all([
      this.getGuildEntries(guildId),
      this.getUserEntries(userId),
    ]);

    const merged = new Map<string, string>();
    for (const { word, reading } of guildEntries) {
      merged.set(word, reading);
    }
    for (const { word, reading } of userEntries) {
      merged.set(word, reading);
    }
    return merged;
  }

  // Longest-word-first plain substring replacement -- no morphological analysis. A shorter
  // dictionary word that happens to appear inside a longer word's replacement text can still
  // get replaced on a later pass; this is an accepted limitation, not a bug to fix here.
  public substitute(text: string, dictionary: Map<string, string>): string {
    const words = [...dictionary.keys()].sort((a, b) => b.length - a.length);

    let result = text;
    for (const word of words) {
      if (word === "") {
        continue;
      }
      result = result.split(word).join(dictionary.get(word)!);
    }
    return result;
  }

  public exportGuildDictionary(entries: GuildDictionary[], format: DictionaryExportFormat): string {
    const record = Object.fromEntries(entries.map(({ word, reading }) => [word, reading]));
    return format === "json" ? JSON.stringify(record, null, 2) : stringifyToml(record);
  }

  // Returns null on malformed input (invalid JSON/TOML, or not a flat string->string map) --
  // a file upload is a trust boundary, never `parse`/throw here.
  public parseImport(
    content: string,
    format: DictionaryExportFormat,
  ): Record<string, string> | null {
    try {
      const parsed: unknown = format === "json" ? JSON.parse(content) : parseToml(content);
      const result = DictionaryRecordSchema.safeParse(parsed);
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  }

  public async importGuildDictionary(
    guildId: string,
    entries: Record<string, string>,
    mode: DictionaryImportMode,
  ): Promise<number> {
    const words = Object.entries(entries);

    if (mode === "replace") {
      // Atomic: delete + recreate in one transaction, so a failure partway through rolls
      // back rather than leaving the dictionary emptied with only some entries restored.
      await this.state.database.guildDictionary.replaceAll(
        guildId,
        words.map(([word, reading]) => ({ word, reading })),
      );
    } else {
      for (const [word, reading] of words) {
        await this.state.database.guildDictionary.upsert({ guildId, word, reading });
      }
    }

    this.state.memory.guildDictionary.delete(guildId);
    return words.length;
  }

  // Fetches an admin-uploaded dictionary file (a Discord CDN attachment URL, not user-typed
  // input) via safeFetch -- keeps the actual network request inside app-core rather than
  // handing a raw URL to presentation-bot, matching how Tts.ts fetches synthesis audio.
  public async importFromUrl(
    guildId: string,
    url: string,
    format: DictionaryExportFormat,
    mode: DictionaryImportMode,
  ): Promise<{ count: number } | { error: DictionaryImportError }> {
    const safeUrlValue = validateSafeUrl(url);
    if (!safeUrlValue) {
      return { error: "fetch_failed" };
    }

    const response = await safeFetch(safeUrlValue);
    if (response instanceof Error) {
      return { error: "fetch_failed" };
    }

    const entries = this.parseImport(await response.text(), format);
    if (!entries) {
      return { error: "invalid_format" };
    }

    const count = await this.importGuildDictionary(guildId, entries, mode);
    return { count };
  }
}
