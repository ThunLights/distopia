import type { AppState } from "app-core/AppState";
import { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";

export const memory: AppState["memory"] = {
  latelimit: {
    bump: new GuildBumpLateLimit(),
  },
};
