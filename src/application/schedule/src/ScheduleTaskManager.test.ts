import { describe, expect, test } from "vitest";

import { ScheduleTaskManager } from "./ScheduleTaskManager";

describe("ScheduleTaskManager", () => {
  test("add", async () => {
    const manager = new ScheduleTaskManager();
    let excuted = 0;
    const taskId = await manager.add("* * * * * *", () => {
      excuted += 1;
    });

    await new Promise((r) => {
      setTimeout(r, 1000);
    });

    expect(excuted).toBe(1);

    manager.delete(taskId);
  });
});
