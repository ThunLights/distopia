import type { DatabaseClient } from "infra-database/types";
import type { Controller } from "infra-discord";
import type { GuildEdit } from "repo-memory/GuildEdit";
import type { GuildMemberAdd } from "repo-memory/GuildMemberAdd";
import type { JWTKey } from "repo-memory/JWTKey";
import type { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";
import type { MessageCreateLateLimit } from "repo-memory/latelimit/MessageCreateLateLimit";
import type { MessageCreate } from "repo-memory/MessageCreate";
import type { UnJoinedGuild } from "repo-memory/UnJoinedGuild";
import type { UserJWTVerifyKey } from "repo-memory/UserJWTVerifyKey";
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
    jwtKey: JWTKey;
    messageCreate: MessageCreate;
    unJoinedGuild: UnJoinedGuild;
    userJWTVerifyKey: UserJWTVerifyKey;
    voiceChannelMember: VoiceChannelMember;
  };
  discord: Controller;
  database: DatabaseClient;
};
