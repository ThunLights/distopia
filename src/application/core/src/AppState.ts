import type { ScheduleTaskManager } from "app-schedule";
import type { PrismaClient } from "infra-database/prelude/prisma";
import type { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";

export type AppState = {
  owner: {
    id: string;
  };
  memory: {
    latelimit: {
      bump: GuildBumpLateLimit;
    };
  };
  database: PrismaClient;
  schedule: ScheduleTaskManager;
};
