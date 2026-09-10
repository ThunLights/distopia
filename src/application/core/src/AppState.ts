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
  // (mis)named `supportServerId`, which read confusingly close to the unrelated "Supporter"
  // feature (app-core/constant's supportersKeyValue, third-party partner orgs' servers).
  homeServerId: string;
  url: string;
  // Optional -- VOICEVOX TTS Quest's paid, low-latency endpoint (deprecatedapis.tts.quest/v2)
  // requires a key. infra-voicevox's synthesize() falls back to the free, unauthenticated v3
  // API whenever this is null/unset or the fast endpoint itself fails (e.g. its points are
  // exhausted), so no environment needs to set this for TTS to keep working.
  voicevoxApiKey: string | null;
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
