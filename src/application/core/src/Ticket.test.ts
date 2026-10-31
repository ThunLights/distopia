import type { Ticket as TicketModel } from "infra-database/types";
import { describe, expect, test } from "vitest";

import type { AppState } from "./AppState";
import { Ticket, type TicketActor } from "./Ticket";

function setup(ticketRole: string | null) {
  return new Ticket({} as AppState, { getSetting: async () => ({ ticketRole }) as never });
}

const actor = (overrides: Partial<TicketActor> = {}): TicketActor => ({
  userId: "member",
  isAdministrator: false,
  roleIds: [],
  ...overrides,
});

const ticket = (claimedBy: string | null = null): TicketModel => ({
  channelId: "channel",
  guildId: "guild",
  userId: "opener",
  claimedBy,
  createdAt: new Date(0),
});

describe("isStaff", () => {
  test("allows administrators and the support role", async () => {
    expect(await setup(null).isStaff("guild", actor({ isAdministrator: true }))).toBe(true);
    expect(await setup("9").isStaff("guild", actor({ roleIds: ["9"] }))).toBe(true);
  });

  test("rejects other members, including when no role is set", async () => {
    expect(await setup("9").isStaff("guild", actor({ roleIds: ["8"] }))).toBe(false);
    expect(await setup(null).isStaff("guild", actor({ roleIds: ["8"] }))).toBe(false);
  });
});

describe("canClose", () => {
  test("allows the opener and staff, not added members", async () => {
    const core = setup("9");
    expect(await core.canClose(ticket(), actor({ userId: "opener" }))).toBe(true);
    expect(await core.canClose(ticket(), actor({ roleIds: ["9"] }))).toBe(true);
    expect(await core.canClose(ticket(), actor())).toBe(false);
  });
});

describe("canChangeClaim", () => {
  test("blocks only another staff member's claim, unless administrator", () => {
    const core = setup("9");
    expect(core.canChangeClaim(ticket(), actor())).toBe(true);
    expect(core.canChangeClaim(ticket("member"), actor())).toBe(true);
    expect(core.canChangeClaim(ticket("other"), actor())).toBe(false);
    expect(core.canChangeClaim(ticket("other"), actor({ isAdministrator: true }))).toBe(true);
  });
});
