import "infra-sentry";
import { resetEphemeralMemory } from "repo-redis";

import { handleClient } from "./client";
import { core } from "./server/core";
import { client } from "./server/discord";
import { startBotRpcServer } from "./server/rpc";

process.on("uncaughtException", (error) => {
  // @discordjs/voice's VoiceUDPSocket.destroy() doesn't cancel its first keep-alive
  // (setImmediate), so a socket destroyed right after creation (a voice connection taken over
  // mid-handshake) sends on a closed socket. Harmless; only dgram's voice socket can raise it.
  if ((error as NodeJS.ErrnoException).code === "ERR_SOCKET_DGRAM_NOT_RUNNING") {
    console.warn("[voice] keep-alive sent on a destroyed UDP socket", error);
    return;
  }
  console.error(error);
});

process.on("unhandledRejection", (reason) => {
  console.error(reason);
});

const { BOT_TOKEN } = process.env;
if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is required");
}

// Wipes this process's "bot:ephemeral:*" namespace -- see presentation-web's
// hooks.server.ts, which used to do this for both "web" and "bot" back when one process
// played both roles.
await resetEphemeralMemory(core.state.redis, "bot");
console.log("Reset ephemeral bot memory.");

await handleClient(client, core).login(BOT_TOKEN);
console.log("BOT logged in.");

startBotRpcServer();
