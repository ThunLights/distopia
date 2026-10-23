import type { GuildRecordUpsertInput } from "infra-database/types";
import { describe, expect, it } from "vitest";

import type { AppState } from "./AppState";
import { Message } from "./Message";

describe("Message.syncDB", () => {
  it("persists the guild level/point it computes from buffered messages", async () => {
    const saved: GuildRecordUpsertInput[] = [];
    const message = new Message({
      memory: {
        messageCreate: {
          entries: async () => [["g1", { messageLens: [4, 9], updatedAt: new Date() }]],
          clear: async () => {},
        },
      },
      database: {
        guildRecord: {
          findAll: async () => [{ guildId: "g1", level: 2n, point: 3n }],
          upsertAll: async (rows: GuildRecordUpsertInput[]) => void saved.push(...rows),
        },
        guildRecordOneDay: {
          findFixedTimesAll: async () => [],
          upsertAll: async () => {},
        },
      },
    } as unknown as AppState);

    await message.syncDB();

    // Gains are sqrt(4)=2 and sqrt(9)=3: level 2 needs 4, so 3+2 -> level 3 (1 left), +3 -> 4.
    expect(saved).toEqual([{ guildId: "g1", level: 3n, point: 4n }]);
  });
});
