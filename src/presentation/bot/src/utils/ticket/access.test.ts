import type { AppCore } from "app-core";
import { Collection, OverwriteType, type Guild } from "discord.js";
import { describe, expect, test } from "vitest";

import { isTicketStaff, staffOverwrites } from "./access";

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

function setup(ticketRole: string | null, admin: boolean, roles: string[]) {
  const core = { guild: { getSetting: async () => ({ ticketRole }) } } as unknown as Pick<
    AppCore,
    "guild"
  >;
  const guild = {
    id: "1",
    members: {
      fetch: async () => ({
        permissions: { has: () => admin },
        roles: { cache: new Set(roles) },
      }),
    },
  } as unknown as Pick<Guild, "id" | "members">;
  return { core, guild };
}

describe("isTicketStaff", () => {
  test("allows administrators", async () => {
    const { core, guild } = setup(null, true, []);
    expect(await isTicketStaff(core, guild, "2")).toBe(true);
  });

  test("allows the support role", async () => {
    const { core, guild } = setup("9", false, ["9"]);
    expect(await isTicketStaff(core, guild, "2")).toBe(true);
  });

  test("rejects other members, including when no role is set", async () => {
    const other = setup("9", false, ["8"]);
    const unset = setup(null, false, ["8"]);
    expect(await isTicketStaff(other.core, other.guild, "2")).toBe(false);
    expect(await isTicketStaff(unset.core, unset.guild, "2")).toBe(false);
  });
});
