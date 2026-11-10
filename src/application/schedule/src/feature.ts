import type { AppCore } from "app-core";

export type ScheduleTask = (core: AppCore) => Promise<unknown>;

// Keyed by cron expression; every feature listing the same expression shares one tick.
export type ScheduleFeature = Record<string, ScheduleTask[]>;

export function mergeScheduleFeatures(features: ScheduleFeature[]) {
  const tasks = new Map<string, ScheduleTask[]>();
  for (const feature of features) {
    for (const [cron, list] of Object.entries(feature)) {
      tasks.set(cron, [...(tasks.get(cron) ?? []), ...list]);
    }
  }
  return tasks;
}
