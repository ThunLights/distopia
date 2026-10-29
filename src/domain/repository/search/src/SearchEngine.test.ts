import { describe, expect, test } from "vitest";

import { SearchEngine } from "./SearchEngine";

describe("Search Engine", async () => {
  const searchEngine = new SearchEngine();

  test("search", async () => {
    await searchEngine.upsert({
      guildId: "11111111111",
      name: "こんにちは",
      description: "hello world",
      nsfw: false,
      tags: ["game", "programming"],
    });

    const result = await searchEngine.search("program");

    expect(result.count).toBe(1);
  });

  test("delete", async () => {
    await searchEngine.upsert({
      guildId: "22222222222",
      name: "削除するサーバー",
      description: "temporary server",
      nsfw: false,
      tags: ["temporary"],
    });

    await searchEngine.delete("22222222222");

    const result = await searchEngine.search("temporary");

    expect(result.count).toBe(0);
  });

  // A re-saved guild used to be inserted as a second document (Orama keys upsert on `id`,
  // which guild documents didn't have), so /search rendered it twice and Svelte threw
  // each_key_duplicate.
  test("re-upserting a guild replaces it instead of duplicating it", async () => {
    const engine = new SearchEngine();
    const guild = {
      guildId: "33333333333",
      name: "作業部屋",
      description: "作業用サーバー",
      nsfw: false,
      tags: ["作業"],
    };

    await engine.upsert(guild);
    await engine.upsert({ ...guild, description: "作業用サーバー (更新)" });
    await engine.upsertAll([guild]);

    const result = await engine.search("作業");

    expect(result.hits.map(({ guildId }) => guildId)).toEqual([guild.guildId]);
    expect(result.count).toBe(1);
  });

  test("delete removes a guild that was upserted more than once", async () => {
    const engine = new SearchEngine();
    const guild = {
      guildId: "44444444444",
      name: "消えるサーバー",
      description: "消えるサーバーです",
      nsfw: false,
      tags: [],
    };

    await engine.upsert(guild);
    await engine.upsert(guild);
    await engine.delete(guild.guildId);

    expect((await engine.search("消える")).count).toBe(0);
  });

  // removeUnJoinedGuildData deletes guilds that may never have been indexed (e.g. private).
  test("deleting a guild that isn't indexed is a no-op", async () => {
    await expect(new SearchEngine().delete("55555555555")).resolves.toBeUndefined();
  });

  // Removing a document with 2+ tags used to turn Orama's tag-length average into NaN, after
  // which every tag match scored NaN and ranking fell back to insertion order.
  test("re-upserting a multi-tag guild keeps tag matches ranked", async () => {
    const engine = new SearchEngine();
    const nameOnly = {
      guildId: "77777777777",
      name: "ゲーム",
      description: "",
      nsfw: false,
      tags: [],
    };
    const tagged = { ...nameOnly, guildId: "88888888888", tags: ["ゲーム", "雑談"] };
    await engine.upsert(tagged);
    await engine.upsert(nameOnly);
    await engine.upsert(tagged);

    const result = await engine.search("ゲーム");

    expect(result.hits).toEqual([tagged, nameOnly]);
  });

  // upsertMultiple defers removals past 1,000 documents, so a large re-index used to throw.
  test("upsertAll re-indexes more than 1,000 existing guilds", async () => {
    const engine = new SearchEngine();
    const guilds = Array.from({ length: 1001 }, (_, i) => ({
      guildId: `${100000 + i}`,
      name: "大量サーバー",
      description: "",
      nsfw: false,
      tags: [],
    }));

    await engine.upsertAll(guilds);
    await expect(engine.upsertAll(guilds)).resolves.toBeUndefined();
    expect((await engine.search("大量", { filter: {} })).count).toBe(1001);
  });

  test("hits don't leak the internal document id", async () => {
    const engine = new SearchEngine();
    await engine.upsert({
      guildId: "66666666666",
      name: "作業部屋",
      description: "",
      nsfw: false,
      tags: [],
    });

    const [hit] = (await engine.search("作業")).hits;

    expect(hit).not.toHaveProperty("id");
    expect(hit).not.toHaveProperty("tagText");
    expect(hit?.guildId).toBe("66666666666");
  });
});
