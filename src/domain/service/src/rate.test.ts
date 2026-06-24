import { describe, expect, test } from "vitest";

import { calcActiveRate, calcActiveRateSync } from "./rate";

// Weights from the source: h1=8, h2=6, h3=10, h4=8, h5=4, h6=50.
// Expected values below were derived analytically for each isolated term.

const ALL_ZERO = {
  newMember: 0,
  newMessage: 0,
  vcMemberSum: 0,
  vcMemberUpperTwo: 0,
  activeMember: 0,
  allMember: 0,
};

describe("calcActiveRateSync", () => {
  test("all-zero inputs produce 0", () => {
    expect(calcActiveRateSync(ALL_ZERO)).toBe(0);
  });

  // term1 = newMember * 8; with all other terms zero: result = ceil(newMember * 8 * 50)
  test("newMember contributes linearly: n * 400", () => {
    expect(calcActiveRateSync({ ...ALL_ZERO, newMember: 1 })).toBe(400);
    expect(calcActiveRateSync({ ...ALL_ZERO, newMember: 3 })).toBe(1200);
    expect(calcActiveRateSync({ ...ALL_ZERO, newMember: 5 })).toBe(2000);
  });

  // term2 = log(newMessage+1) * cbrt(newMessage) * 6; newMessage=1 → log(2)*1*6*50
  test("newMessage=1 only → 208", () => {
    // log(2) * 1 * 6 * 50 = 207.944... → ceil = 208
    expect(calcActiveRateSync({ ...ALL_ZERO, newMessage: 1 })).toBe(208);
  });

  // term4 = log(activeMember+1) * 4; activeMember=1 → log(2)*4*50
  test("activeMember=1 only → 139", () => {
    // log(2) * 4 * 50 = 138.629... → ceil = 139
    expect(calcActiveRateSync({ ...ALL_ZERO, activeMember: 1 })).toBe(139);
  });

  // term5 = cbrt(allMember) - allMember^1.1 / (activeMember+1)
  // For allMember=1, activeMember=0: 1 - 1 = 0 → total 0
  test("allMember=1, activeMember=0: term5 = 0 → result 0", () => {
    expect(calcActiveRateSync({ ...ALL_ZERO, allMember: 1 })).toBe(0);
  });

  // For large allMember with activeMember=0, allMember^1.1/1 dominates cbrt(allMember),
  // making term5 negative and the overall result negative.
  test("result can be negative when allMember is large and activeMember is 0", () => {
    // allMember=8: cbrt(8) - 8^1.1 = 2 - 9.849... = -7.849...; *50 = -392.45... → ceil = -392
    expect(calcActiveRateSync({ ...ALL_ZERO, allMember: 8 })).toBe(-392);
  });

  // vcMemberUpperTwo=0 zeroes out term3 regardless of vcMemberSum
  test("vcMemberSum with vcMemberUpperTwo=0 contributes nothing", () => {
    const base = calcActiveRateSync(ALL_ZERO);
    const withVcSum = calcActiveRateSync({ ...ALL_ZERO, vcMemberSum: 100 });
    expect(withVcSum).toBe(base);
  });

  // More newMembers always raise the result (term1 is strictly additive)
  test("increasing newMember strictly increases result", () => {
    const r1 = calcActiveRateSync({ ...ALL_ZERO, newMember: 2 });
    const r2 = calcActiveRateSync({ ...ALL_ZERO, newMember: 4 });
    expect(r2).toBeGreaterThan(r1);
  });

  // More messages → higher term2 (log and cbrt are both monotonically increasing for x>0)
  test("increasing newMessage strictly increases result", () => {
    const r1 = calcActiveRateSync({ ...ALL_ZERO, newMessage: 10 });
    const r2 = calcActiveRateSync({ ...ALL_ZERO, newMessage: 100 });
    expect(r2).toBeGreaterThan(r1);
  });

  // The return value is always a JavaScript integer (Math.ceil guarantees this)
  test("result is always an integer", () => {
    const cases = [
      {
        newMember: 3,
        newMessage: 50,
        vcMemberSum: 10,
        vcMemberUpperTwo: 3,
        activeMember: 20,
        allMember: 300,
      },
      {
        newMember: 0,
        newMessage: 7,
        vcMemberSum: 5,
        vcMemberUpperTwo: 2,
        activeMember: 5,
        allMember: 100,
      },
    ];
    for (const input of cases) {
      expect(Number.isInteger(calcActiveRateSync(input))).toBe(true);
    }
  });

  // Pure function: identical inputs must always produce identical output
  test("is deterministic for the same inputs", () => {
    const input = {
      newMember: 5,
      newMessage: 100,
      vcMemberSum: 20,
      vcMemberUpperTwo: 5,
      activeMember: 30,
      allMember: 500,
    };
    expect(calcActiveRateSync(input)).toBe(calcActiveRateSync(input));
  });
});

describe("calcActiveRate (async wrapper)", () => {
  test("returns the same value as the sync version", async () => {
    const input = {
      newMember: 2,
      newMessage: 30,
      vcMemberSum: 8,
      vcMemberUpperTwo: 2,
      activeMember: 10,
      allMember: 200,
    };
    expect(await calcActiveRate(input)).toBe(calcActiveRateSync(input));
  });
});
