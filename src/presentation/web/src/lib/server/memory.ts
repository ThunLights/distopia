import { redis } from "./redis";
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
  GuildStickyMessage,
  GuildTtsIgnoreList,
  GuildVerify,
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

// Ownership notes:
// - The four ratelimit stores, unJoinedGuild, urlCacheInMemory, guildMemberAdd,
//   messageCreate, voiceChannelMember, ttsSynthesisCache, and every guild-settings-shaped
//   store below (guildBlackList/guildDictionary/guildEdit/guildSetting/guildStickyMessage/
//   guildTtsIgnoreList/guildVerify/guildWhiteList/userDictionary/friend) are bot-owned -- all
//   written from Discord slash commands/buttons/modals (presentation-bot) or bot-driven cron
//   jobs, confirmed by grepping every call site.
// - oauth2PKCE, oauth2Guilds, userOAuth2, jwtKey, userJWTVerifyKey are web-owned (OAuth2
//   login flow, JWT session auth).
// All of them are still instantiated here regardless of owner tag, same as in
// presentation-bot's own server/memory.ts: AppCore (and therefore AppState["memory"]'s full
// shape) is shared code neither process's build knows is "the other one," and every store
// here is just a thin Redis client wrapper -- cheap to construct twice, both pointing at the
// same Redis. The owner tag ("bot"/"web") is baked into each store's Redis key, not into
// which process is allowed to construct the class.
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
  guildStickyMessage: new GuildStickyMessage(redis, "bot"),
  guildTtsIgnoreList: new GuildTtsIgnoreList(redis, "bot"),
  guildVerify: new GuildVerify(redis, "bot"),
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
