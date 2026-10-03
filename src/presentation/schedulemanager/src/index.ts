import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { ScheduleTaskManager } from "app-schedule";
import { createBearerAuthInterceptor, SchedulerService } from "infra-rpc";

const { SCHEDULEMANAGER_RPC_URL, SCHEDULEMANAGER_RPC_TOKEN } = process.env;
if (!SCHEDULEMANAGER_RPC_URL || !SCHEDULEMANAGER_RPC_TOKEN) {
  throw new Error("SCHEDULEMANAGER_RPC_URL and SCHEDULEMANAGER_RPC_TOKEN are required");
}

const transport = createConnectTransport({
  baseUrl: SCHEDULEMANAGER_RPC_URL,
  httpVersion: "1.1",
  interceptors: [createBearerAuthInterceptor(SCHEDULEMANAGER_RPC_TOKEN)],
});
const client = createClient(SchedulerService, transport);

const manager = new ScheduleTaskManager();

// node-cron's `noOverlap` only prevents a task from overlapping its OWN next tick, not the
// two tasks from running concurrently with each other -- at every 20-minute mark both fire
// at once, which is exactly the concurrent guildRecord(OneDay) upsert that deadlocks
// (Postgres 40P01). Chaining both bodies onto one shared promise serializes them across
// tasks too; `.then(fn, fn)` keeps the chain alive even if a run throws.
let queue: Promise<unknown> = Promise.resolve();
function serialized(fn: () => Promise<unknown>) {
  return () => (queue = queue.then(fn, fn));
}

await manager.add(
  "*/5 * * * *",
  serialized(async () => {
    await client.runFiveMinuteTasks({});
  }),
  { noOverlap: true },
);

await manager.add(
  "*/20 * * * *",
  serialized(async () => {
    await client.runTwentyMinuteTasks({});
  }),
  { noOverlap: true },
);

console.log("schedulemanager started, ticking against", SCHEDULEMANAGER_RPC_URL);
