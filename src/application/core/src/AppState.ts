import type { ScheduleTaskManager } from "app-schedule";
import type { PrismaClient } from "infra-database/prelude/prisma";
import type { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";

import type { getPublicConstants } from "./utils/constant";

export type AppState = {
  owner: {
    id: string;
  };
  memory: {
    latelimit: {
      bump: GuildBumpLateLimit;
    };
  };
  constants: ReturnType<typeof getPublicConstants>;
  database: PrismaClient;
  schedule: ScheduleTaskManager;
};
