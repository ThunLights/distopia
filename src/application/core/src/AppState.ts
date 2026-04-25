import type { DatabaseClient } from "infra-database/types";
import type { GuildEdit } from "repo-memory/GuildEdit";
import type { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";

import type { getPublicConstants } from "./utils/constant";

export type AppState = {
  owner: {
    id: string;
  };
  url: string;
  memory: {
    latelimit: {
      bump: GuildBumpLateLimit;
    };
    guildEdit: GuildEdit;
  };
  constants: ReturnType<typeof getPublicConstants>;
  database: DatabaseClient;
};
