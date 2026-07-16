import type { DatabaseClient } from "infra-database/types";
import type { Controller } from "infra-discord";
import type {
  ButtonLateLimit,
  ChatInputCommandLateLimit,
  Friend,
  GuildBumpLateLimit,
  GuildEdit,
  GuildMemberAdd,
  GuildSetting,
  GuildWhiteList,
  JWTKey,
  MessageCreate,
  MessageCreateLateLimit,
  OAuth2Guilds,
  OAuth2PKCE,
  UnJoinedGuild,
  UrlCacheInMemory,
  UserJWTVerifyKey,
  UserOAuth2,
  VoiceChannelMember,
} from "repo-memory";
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
