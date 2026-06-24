import { describe, expect, test } from "vitest";

import { VoiceChannelMember } from "./VoiceChannelMember";

// ── gc() ─────────────────────────────────────────────────────────────────────

describe("VoiceChannelMember.gc()", () => {
  test("truncates memberCounts longer than 40 to exactly 40 elements", () => {
    const map = new VoiceChannelMember();
    map.set("over", { memberCounts: Array.from({ length: 41 }, (_, i) => i) });
    map.gc();
    expect(map.get("over")!.memberCounts).toHaveLength(40);
  });

  test("keeps exactly the first 40 elements (slice from index 0)", () => {
    const map = new VoiceChannelMember();
    map.set("guild", { memberCounts: Array.from({ length: 50 }, (_, i) => i + 1) });
    map.gc();
    const counts = map.get("guild")!.memberCounts;
    expect(counts[0]).toBe(1);
    expect(counts[39]).toBe(40);
    expect(counts).toHaveLength(40);
  });

  test("does not modify entries with exactly 40 elements", () => {
    const map = new VoiceChannelMember();
    const fortyItems = Array.from({ length: 40 }, (_, i) => i);
    map.set("exact", { memberCounts: fortyItems });
    map.gc();
    expect(map.get("exact")!.memberCounts).toHaveLength(40);
  });

  test("does not modify entries with fewer than 40 elements", () => {
    const map = new VoiceChannelMember();
    map.set("small", { memberCounts: [1, 2, 3] });
    map.gc();
    expect(map.get("small")!.memberCounts).toEqual([1, 2, 3]);
  });

  test("handles multiple guilds independently", () => {
    const map = new VoiceChannelMember();
    map.set("g1", { memberCounts: Array.from({ length: 55 }, (_, i) => i) });
    map.set("g2", { memberCounts: [10, 20] });
    map.gc();
    expect(map.get("g1")!.memberCounts).toHaveLength(40);
    expect(map.get("g2")!.memberCounts).toEqual([10, 20]);
  });

  test("empty map stays empty after gc", () => {
    const map = new VoiceChannelMember();
    map.gc();
    expect(map.size).toBe(0);
  });
});

// ── pushMemberCounts() ───────────────────────────────────────────────────────

describe("VoiceChannelMember.pushMemberCounts()", () => {
  test("creates a new entry when the guild does not exist", () => {
    const map = new VoiceChannelMember();
    map.pushMemberCounts("guild1", 5);
    expect(map.get("guild1")).toEqual({ memberCounts: [5] });
  });

  test("appends to an existing entry", () => {
    const map = new VoiceChannelMember();
    map.set("guild1", { memberCounts: [1, 2, 3] });
    map.pushMemberCounts("guild1", 4);
    expect(map.get("guild1")).toEqual({ memberCounts: [1, 2, 3, 4] });
  });

  test("successive pushes accumulate values in order", () => {
    const map = new VoiceChannelMember();
    map.pushMemberCounts("g", 10);
    map.pushMemberCounts("g", 20);
    map.pushMemberCounts("g", 30);
    expect(map.get("g")!.memberCounts).toEqual([10, 20, 30]);
  });

  test("does not mutate the previously stored array reference", () => {
    const map = new VoiceChannelMember();
    const original = [1, 2];
    map.set("guild1", { memberCounts: original });
    map.pushMemberCounts("guild1", 3);
    // The spread in pushMemberCounts creates a new array, leaving original untouched.
    expect(original).toEqual([1, 2]);
  });

  test("different guild IDs are stored independently", () => {
    const map = new VoiceChannelMember();
    map.pushMemberCounts("g1", 1);
    map.pushMemberCounts("g2", 2);
    expect(map.get("g1")!.memberCounts).toEqual([1]);
    expect(map.get("g2")!.memberCounts).toEqual([2]);
  });
});
