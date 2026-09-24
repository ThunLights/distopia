import type { DatabaseClient } from "infra-database/types";
import type { Controller } from "infra-discord";
import type { RedisClient } from "infra-redis";
// Redis-backed -- migrated off repo-memory's in-process Map so it's readable across
// processes/languages instead of trapped in one Node process's memory. Each field is its own
// per-table class (ButtonRateLimit, GuildSetting, ...) extending a shared base
// (ExpiringDate/ExpiringValue/RedisHashMap) that owns the actual Redis plumbing -- see each
// type's own repo-redis module for its TTL (or lack of one, where the original had no gc()
// at all) and resetEphemeralMemory for the owner-scoped boot-time reset that reproduces
// "fresh Map on every process start" for the ephemeral (non-DB-backed) stores.
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
  TtsSynthesisCache,
  UnJoinedGuild,
  UrlCacheInMemory,
  UserDictionary,
  UserJWTVerifyKey,
  UserOAuth2,
  VoiceChannelMember,
} from "repo-redis";
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
    ttsSynthesisCache: TtsSynthesisCache;
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
  // Durable (survives a process restart, unlike `memory` above) -- used to persist which
  // guild's TTS session is bound to which voice/text channel, so a rolling update's brief
  // old-pod/new-pod overlap doesn't lose track of who the bot should rejoin. See
  // Tts.saveVoiceSession/getAllVoiceSessions and presentation-bot's session.ts.
  redis: RedisClient;
};
