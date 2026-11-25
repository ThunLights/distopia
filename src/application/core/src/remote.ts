import { type Client, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import type { Controller, DiscordClient } from "infra-discord";
import type { RedisClient } from "infra-redis";
import { BotService, createBearerAuthInterceptor, SearchEngineService } from "infra-rpc";
import {
  ButtonRateLimit,
  ChatInputCommandRateLimit,
  Friend,
  GuildBlackList,
  GuildBumpRateLimit,
  GuildDictionary,
  GuildEdit,
  GuildLogSetting,
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
  VerifyRateLimit,
  VoiceChannelMember,
} from "repo-redis";
import type { SearchEngineClient } from "repo-search";

import type { AppState } from "./AppState";

// Published by presentation-schedulemanager after its 20-minute jobs; every web pod refreshes
// the read caches it keeps in its own memory (ranking, root page, friends) on receipt.
export const WEB_CACHE_REFRESH_CHANNEL = "web:cache-refresh";

type RpcTarget = { url: string | undefined; token: string | undefined };

// Connect applies no deadline of its own: without one, a peer that accepts the connection but
// never answers (e.g. a bot pod mid-Discord-login) would hang every caller forever.
const RPC_TIMEOUT_MS = 10_000;
// The full search index load sends every public guild in one call.
const SEARCH_LOAD_TIMEOUT_MS = 60_000;

// Built on first call, not at construction: presentation-web's `vite build` prerender
// analysis imports its callers with an empty $app/env/private, so an eager check fails the build.
function lazyClient<S extends typeof BotService | typeof SearchEngineService>(
  service: S,
  name: string,
  { url, token }: RpcTarget,
) {
  let client: Client<S> | undefined;
  return () => {
    if (!client) {
      if (!url || !token) {
        throw new Error(`${name}_RPC_URL and ${name}_RPC_TOKEN are required`);
      }
      client = createClient(
        service,
        createConnectTransport({
          baseUrl: url,
          httpVersion: "1.1",
          defaultTimeoutMs: RPC_TIMEOUT_MS,
          interceptors: [createBearerAuthInterceptor(token)],
        }),
      );
    }
    return client;
  };
}

/**
 * The full `AppState["memory"]` shape over one Redis. Every process builds all of it, since
 * AppCore doesn't know which process it runs in; each store's owner tag ("bot"/"web") is only
 * a Redis key namespace (bot-owned stores are written from Discord interactions or bot-driven
 * cron jobs, web-owned ones from the OAuth2 login flow and JWT session auth).
 */
export function createMemory(redis: RedisClient): AppState["memory"] {
  return {
    ratelimit: {
      messageCreate: new MessageCreateRateLimit(redis, "bot"),
      bump: new GuildBumpRateLimit(redis, "bot"),
      button: new ButtonRateLimit(redis, "bot"),
      chatInputCommand: new ChatInputCommandRateLimit(redis, "bot"),
      verify: new VerifyRateLimit(redis, "web"),
    },
    friend: new Friend(redis, "bot"),
    guildBlackList: new GuildBlackList(redis, "bot"),
    guildDictionary: new GuildDictionary(redis, "bot"),
    guildEdit: new GuildEdit(redis, "bot"),
    guildLogSetting: new GuildLogSetting(redis, "bot"),
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
}

/** `SearchEngineClient` forwarded to presentation-searchengine, which owns the Orama index. */
export function createRemoteSearchEngine(target: RpcTarget): SearchEngineClient {
  const rpc = lazyClient(SearchEngineService, "SEARCHENGINE", target);
  return {
    async upsert(value) {
      await rpc().upsert({ value });
    },

    async upsertAll(values) {
      await rpc().upsertAll({ values }, { timeoutMs: SEARCH_LOAD_TIMEOUT_MS });
    },

    async delete(guildId) {
      await rpc().delete({ guildId });
    },

    async search(term, options) {
      const { hits, count, time } = await rpc().search({
        term,
        nsfw: options?.filter.nsfw,
        serverTag: options?.filter.serverTag,
        alg: options?.alg,
      });
      return { hits, count, time };
    },
  };
}

/**
 * `DiscordClient` for a process without its own gateway connection: the live-cache half goes
 * to presentation-bot (the one logged-in discord.js Client) over RPC, while `local` — a
 * never-logged-in Controller — serves the pure REST/CDN half (oauth2, embed, guild.iconUrl).
 */
export function createRemoteDiscordClient(local: Controller, target: RpcTarget): DiscordClient {
  const rpc = lazyClient(BotService, "BOT", target);
  return {
    oauth2: local.oauth2,
    embed: local.embed,

    guild: {
      iconUrl: local.guild.iconUrl.bind(local.guild),

      async fetch(guildId) {
        const { guild } = await rpc().fetchGuild({ guildId });
        return guild ?? null;
      },

      async fetchOwnerId(guildId) {
        return (await rpc().fetchOwnerId({ guildId })).ownerId;
      },

      async fetchAdminIds(guildId) {
        return (await rpc().fetchAdminIds({ guildId })).userIds;
      },

      async fetchMemberCount(guildId, onlineOnly) {
        return (await rpc().fetchMemberCount({ guildId, onlineOnly: onlineOnly ?? false })).count;
      },

      async fetchMemberCounts(guildId) {
        return (await rpc().fetchMemberCounts({ guildId })).counts ?? null;
      },

      async fetchBoostCount(guildId) {
        return (await rpc().fetchBoostCount({ guildId })).count;
      },

      async isJoined(guildId) {
        return (await rpc().isJoined({ guildId })).joined;
      },

      async fetchWhiteListTargetName(guildId, idType, targetId) {
        return (await rpc().fetchWhiteListTargetName({ guildId, idType, targetId })).name ?? null;
      },
    },

    channel: {
      async fetchVoiceChannel() {
        return (await rpc().fetchVoiceChannels({})).channels;
      },

      async rename(channelId, name) {
        return (await rpc().renameChannel({ channelId, name })).ok;
      },

      async existsVoiceChannel(channelId) {
        return (await rpc().existsVoiceChannel({ channelId })).exists;
      },

      async create(guildId, name) {
        const { channelId } = await rpc().createVoiceChannel({ guildId, name });
        return channelId ? { id: channelId } : null;
      },
    },

    role: {
      async fetchGuild(guildId, roleId) {
        return (await rpc().fetchRoleMemberIds({ guildId, roleId })).userIds;
      },

      async give(guildId, userId, roleId) {
        await rpc().giveRole({ guildId, userId, roleId });
      },

      async deprive(guildId, userId, roleId) {
        await rpc().depriveRole({ guildId, userId, roleId });
      },
    },

    user: {
      async find(userId) {
        const { user } = await rpc().findUser({ userId });
        return user ?? null;
      },

      async setActivity() {
        await rpc().setActivity({});
      },
    },

    message: {
      async edit(channelId, messageId, embeds) {
        await rpc().editMessage({ channelId, messageId, embedsJson: JSON.stringify(embeds) });
      },

      async send(channelId, embeds) {
        const { messageId } = await rpc().sendMessage({
          channelId,
          embedsJson: JSON.stringify(embeds),
        });
        return messageId ? { id: messageId } : null;
      },

      async delete(channelId, messageId) {
        await rpc().deleteMessage({ channelId, messageId });
      },
    },
  };
}
