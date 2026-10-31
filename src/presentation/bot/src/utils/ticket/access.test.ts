import { Collection, OverwriteType, type Guild } from "discord.js";
import { describe, expect, test } from "vitest";

import { staffOverwrites, ticketActor } from "./access";

describe("staffOverwrites", () => {
  test("keeps roles and the bot, drops the opener and added members", () => {
    const overwrites = new Collection(
      [
        { id: "everyone", type: OverwriteType.Role },
        { id: "support", type: OverwriteType.Role },
        { id: "bot", type: OverwriteType.Member },
        { id: "opener", type: OverwriteType.Member },
        { id: "added", type: OverwriteType.Member },
      ].map((overwrite) => [overwrite.id, overwrite] as const),
    );

    expect([...staffOverwrites(overwrites, "bot").keys()]).toEqual(["everyone", "support", "bot"]);
  });
});

describe("ticketActor", () => {
  test("maps a guild member to the actor core decides on", async () => {
    const guild = {
      members: {
        fetch: async () => ({
          permissions: { has: (permission: string) => permission === "Administrator" },
          roles: { cache: new Map([["9", {}]]) },
        }),
      },
    } as unknown as Pick<Guild, "members">;

    expect(await ticketActor(guild, "2")).toEqual({
      userId: "2",
      isAdministrator: true,
      roleIds: ["9"],
    });
  });
});
