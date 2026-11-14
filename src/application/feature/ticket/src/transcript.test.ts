import { Collection, type Message } from "discord.js";
import { describe, expect, test } from "vitest";

import { fetchMessages, formatTranscript } from "./transcript";

describe("transcript.ts", () => {
  test("formatTranscript", () => {
    const text = formatTranscript([
      {
        createdAt: new Date("2026-10-30T00:00:00.000Z"),
        author: { username: "alice" },
        content: "hello",
        attachments: new Collection([["1", { url: "https://example.com/a.png" }]]),
        embeds: [{ fields: [{ name: "件名", value: "質問" }] }],
      },
      {
        createdAt: new Date("2026-10-30T00:00:01.000Z"),
        author: { username: "bob" },
        content: "hi",
        attachments: new Collection(),
        embeds: [],
      },
    ]);

    expect(text).toBe(
      [
        "[2026-10-30T00:00:00.000Z] alice: hello",
        "  件名: 質問",
        "  添付: https://example.com/a.png",
        "[2026-10-30T00:00:01.000Z] bob: hi",
      ].join("\n"),
    );
  });

  test("fetchMessages pages until empty and returns oldest first", async () => {
    const pages = [
      new Collection([
        ["3", { id: "3" } as Message],
        ["2", { id: "2" } as Message],
      ]),
      new Collection([["1", { id: "1" } as Message]]),
      new Collection<string, Message>(),
    ];
    const befores: (string | undefined)[] = [];

    const messages = await fetchMessages({
      messages: {
        async fetch({ before }) {
          befores.push(before);
          return pages.shift() as Collection<string, Message>;
        },
      },
    });

    expect(messages.map(({ id }) => id)).toEqual(["1", "2", "3"]);
    expect(befores).toEqual([undefined, "2", "1"]);
  });
});
