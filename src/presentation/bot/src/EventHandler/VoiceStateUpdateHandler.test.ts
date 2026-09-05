import { describe, expect, test } from "vitest";

import { isConfirmedEmptyOfHumans } from "./VoiceStateUpdateHandler";

describe("isConfirmedEmptyOfHumans", () => {
  test("true when every occupant resolved and all are bots", () => {
    expect(isConfirmedEmptyOfHumans([{ bot: true }], 1)).toBe(true);
  });

  test("false when a resolved occupant is human", () => {
    expect(isConfirmedEmptyOfHumans([{ bot: true }, { bot: false }], 2)).toBe(false);
  });

  test("false when no occupants are cached but a voice state exists (unresolved member)", () => {
    // Simulates the regression case CodeRabbit flagged: a human is in the channel (one voice
    // state) but their GuildMember isn't in the cache, so `channel.members` resolved none.
    expect(isConfirmedEmptyOfHumans([], 1)).toBe(false);
  });

  test("false when fewer members resolved than voice states exist", () => {
    expect(isConfirmedEmptyOfHumans([{ bot: true }], 2)).toBe(false);
  });

  test("true for a genuinely empty channel (only the bot, fully resolved)", () => {
    expect(isConfirmedEmptyOfHumans([{ bot: true }], 1)).toBe(true);
  });

  test("true when there are no voice states and no members at all", () => {
    expect(isConfirmedEmptyOfHumans([], 0)).toBe(true);
  });
});
