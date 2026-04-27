import type { DatabaseClient } from "infra-database/types";
import type { Controller } from "infra-discord";
import type { GuildEdit } from "repo-memory/GuildEdit";
import type { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";

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
  discord: Controller;
  database: DatabaseClient;
};
