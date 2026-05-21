import type { DatabaseClient } from "infra-database/types";
import type { Controller } from "infra-discord";
import type { Friend } from "repo-memory/Friend";
import type { GuildEdit } from "repo-memory/GuildEdit";
import type { GuildMemberAdd } from "repo-memory/GuildMemberAdd";
import type { JWTKey } from "repo-memory/JWTKey";
import type { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";
import type { MessageCreateLateLimit } from "repo-memory/latelimit/MessageCreateLateLimit";
import type { UserBumpLateLimit } from "repo-memory/latelimit/UserBumpLateLimit";
import type { MessageCreate } from "repo-memory/MessageCreate";
import type { OAuth2Guilds } from "repo-memory/OAuth2Guilds";
import type { UnJoinedGuild } from "repo-memory/UnJoinedGuild";
import type { UserJWTVerifyKey } from "repo-memory/UserJWTVerifyKey";
import type { UserOAuth2 } from "repo-memory/UserOAuth2";
import type { VoiceChannelMember } from "repo-memory/VoiceChannelMember";
import type { SearchEngine } from "repo-search";

export type AppState = {
  owner: {
    id: string;
  };
  url: string;
  memory: {
    latelimit: {
      messageCreate: MessageCreateLateLimit;
      bump: GuildBumpLateLimit;
      userBump: UserBumpLateLimit;
    };
    friend: Friend;
    guildEdit: GuildEdit;
    guildMemberAdd: GuildMemberAdd;
    jwtKey: JWTKey;
    messageCreate: MessageCreate;
    oauth2Guilds: OAuth2Guilds;
    unJoinedGuild: UnJoinedGuild;
    userJWTVerifyKey: UserJWTVerifyKey;
    userOAuth2: UserOAuth2;
    voiceChannelMember: VoiceChannelMember;
  };
  searchEngine: SearchEngine;
  discord: Controller;
  database: DatabaseClient;
};
