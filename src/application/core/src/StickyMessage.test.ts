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

  test("overlapping reposts of one channel run one after another", async () => {
    const { stickyMessage, discord } = setup(null, true);
    let inFlight = 0;
    let maxInFlight = 0;
    discord.send.mockImplementation(async () => {
      maxInFlight = Math.max(maxInFlight, ++inFlight);
      await new Promise((resolve) => setTimeout(resolve, 1));
      inFlight--;
      return { id: "new" };
    });
    await Promise.all([stickyMessage.repost("g", "c"), stickyMessage.repost("g", "c")]);
    expect(discord.send).toHaveBeenCalledTimes(2);
    expect(maxInFlight).toBe(1);
  });

  test("deletes the fresh copy and rethrows when recording its id fails", async () => {
    const { stickyMessage, discord, table } = setup(null, true);
    table.update.mockRejectedValue(new Error("db down"));
    await expect(stickyMessage.repost("g", "c")).rejects.toThrow("db down");
    expect(discord.delete).toHaveBeenCalledExactlyOnceWith("c", "new");
  });

  test("reports a failed post when the channel is gone", async () => {
    const { stickyMessage, discord } = setup(null, true);
    discord.send.mockResolvedValue(null);
    expect(await stickyMessage.repost("g", "c")).toBe(false);
  });
});

describe("StickyMessage.delete", () => {
  test("keeps the row when the posted copy can't be removed", async () => {
    const { stickyMessage, discord, table } = setup("old", true);
    const rowDelete = vi.fn();
    Object.assign(table, { delete: rowDelete });
    discord.delete.mockRejectedValue(new Error("Missing Permissions"));
    expect(await stickyMessage.delete("g", "c")).toBe(false);
    expect(rowDelete).not.toHaveBeenCalled();
  });
});
