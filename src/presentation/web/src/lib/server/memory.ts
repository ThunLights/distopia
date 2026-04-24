import type { AppState } from "app-core/AppState";
import { GuildEdit } from "repo-memory/GuildEdit";
import { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";

export const memory: AppState["memory"] = {
  latelimit: {
    bump: new GuildBumpLateLimit(),
  },
  guildEdit: new GuildEdit(),
};
