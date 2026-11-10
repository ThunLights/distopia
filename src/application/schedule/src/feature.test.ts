import { describe, expect, test } from "vitest";

import { mergeScheduleFeatures } from "./feature";

describe("mergeScheduleFeatures", () => {
  test("groups tasks from every feature under their cron expression", () => {
    const a = async () => {};
    const b = async () => {};
    const c = async () => {};

    const merged = mergeScheduleFeatures([
      { "*/5 * * * *": [a] },
      { "*/5 * * * *": [b], "*/20 * * * *": [c] },
    ]);

    expect([...merged.keys()]).toEqual(["*/5 * * * *", "*/20 * * * *"]);
    expect(merged.get("*/5 * * * *")).toEqual([a, b]);
    expect(merged.get("*/20 * * * *")).toEqual([c]);
  });
});
