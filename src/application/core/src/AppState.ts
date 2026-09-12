import type { DatabaseClient } from "infra-database/types";
import type { Controller } from "infra-discord";
import type {
  ButtonRateLimit,
  ChatInputCommandRateLimit,
  Friend,
  GuildBlackList,
  GuildBumpRateLimit,
  GuildDictionary,
  GuildEdit,
  GuildMemberAdd,
  GuildSetting,
  GuildTtsIgnoreList,
  GuildWhiteList,
  JWTKey,
  MessageCreate,
  MessageCreateRateLimit,
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
  homeServerId: string;
  url: string;
  // Optional -- infra-voicevox falls back to the free, unauthenticated API whenever this is
  // unset or the paid endpoint itself fails, so no environment needs to set it for TTS to work.
  voicevoxApiKey: string | null;
  // Optional -- Tts.synthesize() falls back to VOICEVOX whenever a guild has SakuraAi
  // selected (GuildSetting.ttsProvider) but this key is unset.
  sakuraApiKey: string | null;
  memory: {
    ratelimit: {
      button: ButtonRateLimit;
      chatInputCommand: ChatInputCommandRateLimit;
      messageCreate: MessageCreateRateLimit;
      bump: GuildBumpRateLimit;
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
