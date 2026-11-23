import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { features } from "app-feature-loader/schedule";
import { ScheduleTaskManager } from "app-schedule";
import { mergeScheduleFeatures } from "app-schedule/feature";
import { createBearerAuthInterceptor, SchedulerService } from "infra-rpc";
import { page as levelRatePage } from "presentation-bot-kit/page/Ranking/Level";
import { page as activeRatePage } from "presentation-bot-kit/page/Ranking/Rate";
import { page as userBumpPage } from "presentation-bot-kit/page/Ranking/UserBump";

import { core, discord } from "./core";

const {
  SCHEDULEMANAGER_RPC_URL,
  SCHEDULEMANAGER_RPC_TOKEN,
  PUBLIC_HOME_SERVER_ID,
  PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID,
  PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID,
  PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID,
} = process.env;
if (!SCHEDULEMANAGER_RPC_URL || !SCHEDULEMANAGER_RPC_TOKEN) {
  throw new Error("SCHEDULEMANAGER_RPC_URL and SCHEDULEMANAGER_RPC_TOKEN are required");
}

const web = createClient(
  SchedulerService,
  createConnectTransport({
    baseUrl: SCHEDULEMANAGER_RPC_URL,
    httpVersion: "1.1",
    interceptors: [createBearerAuthInterceptor(SCHEDULEMANAGER_RPC_TOKEN)],
  }),
);

async function updatePanels() {
  for (const panel of await core.panel.findAll()) {
    const content =
      panel.type === "ActiveRateRanking"
        ? await activeRatePage(core)
        : panel.type === "LevelRanking"
          ? await levelRatePage(core)
          : await userBumpPage(core);

    await discord.message.edit(
      panel.channelId,
      panel.messageId,
      (content.embeds ?? []).map((embed) => ("toJSON" in embed ? embed.toJSON() : embed)),
    );
  }
}

const manager = new ScheduleTaskManager();

// node-cron's `noOverlap` only prevents a task from overlapping its OWN next tick, not the
// tasks from running concurrently with each other -- at every 20-minute mark they all fire
// at once, which is exactly the concurrent guildRecord(OneDay) upsert that deadlocks
// (Postgres 40P01). Chaining every body onto one shared promise serializes them across
// tasks too; `.then(fn, fn)` keeps the chain alive even if a run throws.
let queue: Promise<unknown> = Promise.resolve();
function serialized(name: string, fn: () => Promise<unknown>) {
  const run = () => fn().catch((error) => console.error(`[schedule] ${name} failed`, error));
  return () => (queue = queue.then(run, run));
}

await manager.add(
  "*/5 * * * *",
  serialized("five-minute tasks", () => core.jwt.update()),
  { noOverlap: true },
);

await manager.add(
  "*/20 * * * *",
  serialized("twenty-minute tasks", async () => {
    await core.oauth2.updateTokens();
    await core.guild.removeUnJoinedGuildData();
    // Also the recovery path for the index itself: presentation-searchengine keeps it in
    // process memory, so a restart there leaves it empty until something re-indexes.
    await core.guild.loadSearchEngine();
    await core.voice.update();
    await core.activeRate.update();
    await core.ranking.cleanCache();
    await core.updateHomeGuildRoles(
      PUBLIC_HOME_SERVER_ID!,
      PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID!,
      PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID!,
      PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID!,
    );
    await core.record.update();
    await updatePanels();
    await core.user.setActivity();
    await web.refreshCaches({});
  }),
  { noOverlap: true },
);

for (const [cron, tasks] of mergeScheduleFeatures(features)) {
  for (const [index, task] of tasks.entries()) {
    // One feature's failure must not starve the others sharing this tick.
    await manager.add(
      cron,
      serialized(`${cron} feature task #${index}`, () => task(core)),
      {
        noOverlap: true,
      },
    );
  }
}

console.log("schedulemanager started");
