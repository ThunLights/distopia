import { describe, expect, test, vi } from "vitest";

import type { AppState } from "./AppState";
import { StickyMessage } from "./StickyMessage";

function setup(messageId: string | null, updated: boolean) {
  const sticky = {
    guildId: "g",
    channelId: "c",
    content: "hello",
    messageId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const discord = {
    send: vi.fn().mockResolvedValue({ id: "new" }),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const table = {
    findAll: vi.fn().mockResolvedValue([sticky]),
    update: vi.fn().mockResolvedValue(updated ? sticky : null),
  };
  const state = {
    memory: {
      guildStickyMessage: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
    },
    database: { guildStickyMessage: table },
    discord: { message: discord },
  } as unknown as AppState;
  return { stickyMessage: new StickyMessage(state), discord, table };
}

describe("StickyMessage.repost", () => {
  test("replaces the previous copy and records the new id", async () => {
    const { stickyMessage, discord, table } = setup("old", true);
    await stickyMessage.repost("g", "c");
    expect(discord.delete).toHaveBeenCalledWith("c", "old");
    expect(discord.send).toHaveBeenCalledOnce();
    expect(table.update).toHaveBeenCalledWith({ guildId: "g", channelId: "c", messageId: "new" });
  });

  test("removes the fresh copy when the sticky was deleted meanwhile", async () => {
    const { stickyMessage, discord } = setup(null, false);
    await stickyMessage.repost("g", "c");
    expect(discord.delete).toHaveBeenCalledExactlyOnceWith("c", "new");
  });
});
