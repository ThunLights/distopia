import type { DatabaseClient } from "infra-database/types";
import type { Controller } from "infra-discord";
import type { GuildEdit } from "repo-memory/GuildEdit";
import type { GuildMemberAdd } from "repo-memory/GuildMemberAdd";
import type { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";
import type { MessageCreateLateLimit } from "repo-memory/latelimit/MessageCreateLateLimit";
import type { MessageCreate } from "repo-memory/MessageCreate";
import type { UnJoinedGuild } from "repo-memory/UnJoinedGuild";
import type { VoiceChannelMember } from "repo-memory/VoiceChannelMember";

export type AppState = {
  owner: {
    id: string;
  };
  url: string;
  memory: {
    latelimit: {
      messageCreate: MessageCreateLateLimit;
      bump: GuildBumpLateLimit;
    };
    guildEdit: GuildEdit;
    guildMemberAdd: GuildMemberAdd;
    messageCreate: MessageCreate;
    unJoinedGuild: UnJoinedGuild;
    voiceChannelMember: VoiceChannelMember;
  };
  discord: Controller;
  database: DatabaseClient;
};
