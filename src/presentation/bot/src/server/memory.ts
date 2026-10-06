import type { AppState } from "app-core/AppState";
import {
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

import { redis } from "./redis";

// Mirrors presentation-web's lib/server/memory.ts -- both processes point at the same Redis
// and construct the full AppState["memory"] shape, since AppCore itself doesn't know which
// process it's running in. Each store's owner tag ("bot"/"web") is a Redis key namespace,
// not a process boundary -- see that file's own comment for the full ownership breakdown.
export const memory: AppState["memory"] = {
  ratelimit: {
    messageCreate: new MessageCreateRateLimit(redis, "bot"),
    bump: new GuildBumpRateLimit(redis, "bot"),
    button: new ButtonRateLimit(redis, "bot"),
    chatInputCommand: new ChatInputCommandRateLimit(redis, "bot"),
  },
  friend: new Friend(redis, "bot"),
  guildBlackList: new GuildBlackList(redis, "bot"),
  guildDictionary: new GuildDictionary(redis, "bot"),
  guildEdit: new GuildEdit(redis, "bot"),
  guildSetting: new GuildSetting(redis, "bot"),
  guildTtsIgnoreList: new GuildTtsIgnoreList(redis, "bot"),
  guildWhiteList: new GuildWhiteList(redis, "bot"),
  guildMemberAdd: new GuildMemberAdd(redis, "bot"),
  jwtKey: new JWTKey(redis, "web"),
  messageCreate: new MessageCreate(redis, "bot"),
  oauth2PKCE: new OAuth2PKCE(redis),
  oauth2Guilds: new OAuth2Guilds(redis, "web"),
  ttsSynthesisCache: new TtsSynthesisCache(redis, "bot"),
  unJoinedGuild: new UnJoinedGuild(redis, "bot"),
  urlCacheInMemory: new UrlCacheInMemory(redis, "bot"),
  userDictionary: new UserDictionary(redis, "bot"),
  userJWTVerifyKey: new UserJWTVerifyKey(redis, "web"),
  userOAuth2: new UserOAuth2(redis, "web"),
  voiceChannelMember: new VoiceChannelMember(redis, "bot"),
};
