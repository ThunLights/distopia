import { describe, expect, test } from "vitest";

import { ScheduleTaskManager } from "./ScheduleTaskManager";

describe("ScheduleTaskManager", () => {
  test("add", async () => {
    const manager = new ScheduleTaskManager();
    let executed = 0;
    const taskId = await manager.add("* * * * * *", () => {
      executed += 1;
    });

    await new Promise((r) => {
      setTimeout(r, 1000);
    });

    expect(executed).toBeGreaterThanOrEqual(1);

    manager.delete(taskId);
  });
});
