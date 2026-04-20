import { describe, expect, test } from "vitest";

import { isStaff, isStaffSync } from "./staff";

describe("isStaff", () => {
  test("Sync", () => {
    expect(isStaffSync("")).toBe(false);
    expect(isStaffSync("123456")).toBe(false);
    expect(isStaffSync("1261634733037719593")).toBe(true);
  });

  test("Async", async () => {
    expect(await isStaff("")).toBe(false);
    expect(await isStaff("123456")).toBe(false);
    expect(await isStaff("1261634733037719593")).toBe(true);
  });
});
