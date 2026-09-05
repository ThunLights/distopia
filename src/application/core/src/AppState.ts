import type { DatabaseClient } from "infra-database/types";
import type { Controller } from "infra-discord";
import type {
  ButtonLateLimit,
  ChatInputCommandLateLimit,
  Friend,
  GuildBlackList,
  GuildBumpLateLimit,
  GuildDictionary,
  GuildEdit,
  GuildMemberAdd,
  GuildSetting,
  GuildTtsIgnoreList,
  GuildWhiteList,
  JWTKey,
  MessageCreate,
  MessageCreateLateLimit,
  OAuth2Guilds,
  OAuth2PKCE,
  UnJoinedGuild,
  UrlCacheInMemory,
  UserDictionary,
  UserJWTVerifyKey,
  UserOAuth2,
  VoiceChannelMember,
} from "repo-memory";
import type { SearchEngine } from "repo-search";

export type AppState = {
  owner: {
    id: string;
  };
  // The project's main/official Discord server (PUBLIC_HOME_SERVER_ID) -- was previously
  // (mis)named `supportServerId` despite never having sourced from a support-server-specific
  // env var. Kept distinct from `supportServerId` below, which is the actual dedicated
  // user-support server.
  homeServerId: string;
  // The project's dedicated user-support Discord server (PUBLIC_SUPPORT_SERVER_ID) -- distinct
  // from `homeServerId`. Also distinct from the unrelated "Supporter" feature
  // (app-core/constant's supportersKeyValue), which lists third-party partner orgs, not this.
  supportServerId: string;
  url: string;
  memory: {
    latelimit: {
      button: ButtonLateLimit;
      chatInputCommand: ChatInputCommandLateLimit;
      messageCreate: MessageCreateLateLimit;
      bump: GuildBumpLateLimit;
    };
    friend: Friend;
    guildBlackList: GuildBlackList;
    guildDictionary: GuildDictionary;
    guildEdit: GuildEdit;
    guildSetting: GuildSetting;
    guildTtsIgnoreList: GuildTtsIgnoreList;
    guildWhiteList: GuildWhiteList;
    guildMemberAdd: GuildMemberAdd;
    jwtKey: JWTKey;
    messageCreate: MessageCreate;
    oauth2PKCE: OAuth2PKCE;
    oauth2Guilds: OAuth2Guilds;
    unJoinedGuild: UnJoinedGuild;
    urlCacheInMemory: UrlCacheInMemory;
    userDictionary: UserDictionary;
    userJWTVerifyKey: UserJWTVerifyKey;
    userOAuth2: UserOAuth2;
    voiceChannelMember: VoiceChannelMember;
  };
  searchEngine: SearchEngine;
  discord: Controller;
  database: DatabaseClient;
};
