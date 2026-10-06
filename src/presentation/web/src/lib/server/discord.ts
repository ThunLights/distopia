import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { type Client, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { Controller, genClient, type DiscordClient } from "infra-discord";
import { BotService, createBearerAuthInterceptor } from "infra-rpc";

// Never logged in -- just a host for the pure, no-live-cache parts of Controller
// (oauth2/embed, and guild.iconUrl), which only need `client.rest.cdn`/REST helpers that
// work without an actual gateway connection. See infra-discord's DiscordClient for why these
// stay local instead of going over RPC.
const local = new Controller(genClient(), {
  id: publicEnv.PUBLIC_BOT_ID!,
  secret: privateEnv.BOT_SECRET!,
  url: `${publicEnv.PUBLIC_URL!}/auth`,
  token: privateEnv.BOT_TOKEN!,
});

let rpcClient: Client<typeof BotService> | undefined;

function rpc() {
  if (!rpcClient) {
    const { BOT_RPC_URL, BOT_RPC_TOKEN } = privateEnv;
    if (!BOT_RPC_URL || !BOT_RPC_TOKEN) {
      throw new Error("BOT_RPC_URL and BOT_RPC_TOKEN are required");
    }

    rpcClient = createClient(
      BotService,
      createConnectTransport({
        baseUrl: BOT_RPC_URL,
        httpVersion: "1.1",
        interceptors: [createBearerAuthInterceptor(BOT_RPC_TOKEN)],
      }),
    );
  }

  return rpcClient;
}

// The live discord.js Client (guild/member/channel cache) now lives in presentation-bot;
// this forwards the cache-dependent half of the Controller surface over Connect RPC, so
// AppCore's call sites (AppState.discord) stay unchanged. See infra-rpc's bot.proto.
export const djsController: DiscordClient = {
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
  },
};
