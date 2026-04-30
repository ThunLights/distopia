import type { AppState } from "app-core/AppState";
import { GuildEdit } from "repo-memory/GuildEdit";
import { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";
import { MessageCreateLateLimit } from "repo-memory/latelimit/MessageCreateLateLimit";

export const memory: AppState["memory"] = {
  latelimit: {
    messageCreate: new MessageCreateLateLimit(),
    bump: new GuildBumpLateLimit(),
  },
  guildEdit: new GuildEdit(),
};
