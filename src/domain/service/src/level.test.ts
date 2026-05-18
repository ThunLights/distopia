import { describe, test, expect } from "vitest";

import { levelUp, levelUpSync } from "./level";

describe("levelUp", () => {
  test("Sync", () => {
    expect(levelUpSync(2n, 0n, 3n)).toEqual({ level: 2n, point: 3n });
    expect(levelUpSync(2n, 0n, 5n)).toEqual({ level: 3n, point: 1n });
  });
  test("Async", async () => {
    expect(await levelUp(2n, 0n, 3n)).toEqual({ level: 2n, point: 3n });
    expect(await levelUp(2n, 0n, 5n)).toEqual({ level: 3n, point: 1n });
  });
});
