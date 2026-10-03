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

await manager.add(
  "*/5 * * * *",
  async () => {
    await client.runFiveMinuteTasks({});
  },
  // Prevent a slow run from overlapping the next tick, which caused
  // concurrent guildRecordOneDay upserts to deadlock (Postgres 40P01)
  // with the */20 job below.
  { noOverlap: true },
);

await manager.add(
  "*/20 * * * *",
  async () => {
    await client.runTwentyMinuteTasks({});
  },
  // This job's runtime scales with guild count (sequential Discord API
  // calls); without noOverlap a slow run can still be executing when the
  // next tick fires, causing concurrent guildRecord upserts to deadlock.
  { noOverlap: true },
);

console.log("schedulemanager started, ticking against", SCHEDULEMANAGER_RPC_URL);
