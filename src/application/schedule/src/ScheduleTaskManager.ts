import { schedule, type ScheduledTask, type TaskFn, type TaskOptions } from "node-cron";

export class ScheduleTaskManager {
  public readonly schedules = new Map<string, ScheduledTask>();

  public async add(exp: string, func: TaskFn | string, options?: TaskOptions) {
    const task = schedule(exp, func, options);
    this.schedules.set(task.id, task);
    return task.id;
  }

  public async remove(id: string) {
    await this.schedules.get(id)?.destroy();
  }

  public async get(id: string) {
    return this.schedules.get(id);
  }

  public get list() {
    return this.schedules.values().toArray();
  }
}
