import type { DatabaseClient } from "infra-database/types";
import type { Controller } from "infra-discord";
import type { Friend } from "repo-memory/Friend";
import type { GuildEdit } from "repo-memory/GuildEdit";
import type { GuildMemberAdd } from "repo-memory/GuildMemberAdd";
import type { GuildSetting } from "repo-memory/GuildSetting";
import type { GuildWhiteList } from "repo-memory/GuildWhiteList";
import type { JWTKey } from "repo-memory/JWTKey";
import type { ButtonLateLimit } from "repo-memory/latelimit/ButtonLateLimit";
import type { ChatInputCommandLateLimit } from "repo-memory/latelimit/ChatInputCommandLateLimit";
import type { GuildBumpLateLimit } from "repo-memory/latelimit/GuildBumpLateLimit";
import type { MessageCreateLateLimit } from "repo-memory/latelimit/MessageCreateLateLimit";
import type { MessageCreate } from "repo-memory/MessageCreate";
import type { OAuth2Guilds } from "repo-memory/OAuth2Guilds";
import type { OAuth2PKCE } from "repo-memory/OAuth2PKCE";
import type { UnJoinedGuild } from "repo-memory/UnJoinedGuild";
import type { UrlCacheInMemory } from "repo-memory/UrlCacheInMemory";
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
      button: ButtonLateLimit;
      chatInputCommand: ChatInputCommandLateLimit;
      messageCreate: MessageCreateLateLimit;
      bump: GuildBumpLateLimit;
    };
    friend: Friend;
    guildEdit: GuildEdit;
    guildSetting: GuildSetting;
    guildWhiteList: GuildWhiteList;
    guildMemberAdd: GuildMemberAdd;
    jwtKey: JWTKey;
    messageCreate: MessageCreate;
    oauth2PKCE: OAuth2PKCE;
    oauth2Guilds: OAuth2Guilds;
    unJoinedGuild: UnJoinedGuild;
    urlCacheInMemory: UrlCacheInMemory;
    userJWTVerifyKey: UserJWTVerifyKey;
    userOAuth2: UserOAuth2;
    voiceChannelMember: VoiceChannelMember;
  };
  searchEngine: SearchEngine;
  discord: Controller;
  database: DatabaseClient;
};
