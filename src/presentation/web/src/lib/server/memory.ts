import type { AppState } from "app-core/AppState";
import { GuildEdit } from "repo-memory/GuildEdit";
import { GuildMemberAdd } from "repo-memory/GuildMemberAdd";
import { MessageCreate } from "repo-memory/MessageCreate";
import { UnJoinedGuild } from "repo-memory/UnJoinedGuild";
import { VoiceChannelMember } from "repo-memory/VoiceChannelMember";
import { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";
import { MessageCreateLateLimit } from "repo-memory/latelimit/MessageCreateLateLimit";

export const memory: AppState["memory"] = {
  latelimit: {
    messageCreate: new MessageCreateLateLimit(),
    bump: new GuildBumpLateLimit(),
  },
  guildEdit: new GuildEdit(),
  guildMemberAdd: new GuildMemberAdd(),
  messageCreate: new MessageCreate(),
  unJoinedGuild: new UnJoinedGuild(),
  voiceChannelMember: new VoiceChannelMember(),
};
