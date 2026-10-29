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
    expect(hit?.guildId).toBe("66666666666");
  });
});
