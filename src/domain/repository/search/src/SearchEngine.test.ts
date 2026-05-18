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
});
