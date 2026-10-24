import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { BotService, createBearerAuthInterceptor } from "infra-rpc";

// Same reasoning as presentation-web's lib/server/discord.ts BOT_RPC_TIMEOUT_MS.
const BOT_RPC_TIMEOUT_MS = 10_000;

// The three presentation-bot RPCs a verification attempt needs -- the role grant and the log
// post. The live discord.js client stays in presentation-bot; this process never logs in.
export type BotClient = {
  giveRole(guildId: string, userId: string, roleId: string): Promise<void>;
  depriveRole(guildId: string, userId: string, roleId: string): Promise<void>;
  sendMessage(channelId: string, embeds: unknown[]): Promise<void>;
};

export function createBotClient(baseUrl: string, token: string): BotClient {
  const rpc = createClient(
    BotService,
    createConnectTransport({
      baseUrl,
      httpVersion: "1.1",
      defaultTimeoutMs: BOT_RPC_TIMEOUT_MS,
      interceptors: [createBearerAuthInterceptor(token)],
    }),
  );

  return {
    async giveRole(guildId, userId, roleId) {
      await rpc.giveRole({ guildId, userId, roleId });
    },
    async depriveRole(guildId, userId, roleId) {
      await rpc.depriveRole({ guildId, userId, roleId });
    },
    async sendMessage(channelId, embeds) {
      await rpc.sendMessage({ channelId, embedsJson: JSON.stringify(embeds) });
    },
  };
}
