import { createServer } from "node:http";

import { connectNodeAdapter } from "@connectrpc/connect-node";
import { BotService, requireBearerAuth } from "infra-rpc";

import { djsController } from "./discord";

const { BOT_RPC_PORT, BOT_RPC_TOKEN } = process.env;
if (!BOT_RPC_PORT || !BOT_RPC_TOKEN) {
  throw new Error("BOT_RPC_PORT and BOT_RPC_TOKEN are required");
}

// ClusterIP-only (see k8s/app/bot-networkpolicy.yaml) -- only distopia-app is allowed to
// reach this port. The bearer token is defense in depth on top of that NetworkPolicy, not a
// substitute for it. Serves the live-cache-dependent subset of infra-discord's Controller
// (see its DiscordClient type) to presentation-web's lib/server/discord.ts.
const handler = connectNodeAdapter({
  routes: (router) =>
    router.service(BotService, {
      async fetchGuild({ guildId }) {
        const guild = await djsController.guild.fetch(guildId);
        return { guild: guild ?? undefined };
      },

      async fetchOwnerId({ guildId }) {
        return { ownerId: await djsController.guild.fetchOwnerId(guildId) };
      },

      async fetchAdminIds({ guildId }) {
        return { userIds: await djsController.guild.fetchAdminIds(guildId) };
      },

      async fetchMemberCount({ guildId, onlineOnly }) {
        return { count: await djsController.guild.fetchMemberCount(guildId, onlineOnly) };
      },

      async fetchMemberCounts({ guildId }) {
        const counts = await djsController.guild.fetchMemberCounts(guildId);
        return { counts: counts ?? undefined };
      },

      async fetchBoostCount({ guildId }) {
        return { count: (await djsController.guild.fetchBoostCount(guildId)) ?? undefined };
      },

      async isJoined({ guildId }) {
        return { joined: await djsController.guild.isJoined(guildId) };
      },

      async fetchWhiteListTargetName({ guildId, idType, targetId }) {
        const name = await djsController.guild.fetchWhiteListTargetName(
          guildId,
          idType as "ChannelId" | "RoleId" | "UserId",
          targetId,
        );
        return { name: name ?? undefined };
      },

      async fetchVoiceChannels() {
        return { channels: await djsController.channel.fetchVoiceChannel() };
      },

      async renameChannel({ channelId, name }) {
        return { ok: await djsController.channel.rename(channelId, name) };
      },

      async existsVoiceChannel({ channelId }) {
        return { exists: await djsController.channel.existsVoiceChannel(channelId) };
      },

      async createVoiceChannel({ guildId, name }) {
        const channel = await djsController.channel.create(guildId, name);
        return { channelId: channel?.id };
      },

      async fetchRoleMemberIds({ guildId, roleId }) {
        return { userIds: await djsController.role.fetchGuild(guildId, roleId) };
      },

      async giveRole({ guildId, userId, roleId }) {
        await djsController.role.give(guildId, userId, roleId);
        return {};
      },

      async depriveRole({ guildId, userId, roleId }) {
        await djsController.role.deprive(guildId, userId, roleId);
        return {};
      },

      async findUser({ userId }) {
        const user = await djsController.user.find(userId);
        return { user: user ?? undefined };
      },

      async setActivity() {
        await djsController.user.setActivity();
        return {};
      },

      async editMessage({ channelId, messageId, embedsJson }) {
        await djsController.message.edit(channelId, messageId, JSON.parse(embedsJson));
        return {};
      },
    }),
  interceptors: [requireBearerAuth(BOT_RPC_TOKEN)],
});

export function startBotRpcServer() {
  createServer(handler).listen(Number(BOT_RPC_PORT));
  console.log("bot RPC server listening on", BOT_RPC_PORT);
}
