import { randomUUID } from "node:crypto";

import type { AppCore } from "app-core";
import { subscribeRedis } from "infra-redis";
import { z } from "zod";

const HANDOVER_CHANNEL = "tts:handover";
// Long enough for the old process to destroy every connection; short enough that a peer
// running a build without this handler (or a hung one) only delays the rejoin a little.
const HANDOVER_TIMEOUT_MS = 5_000;

const instanceId = randomUUID();

const HandoverMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("request"), from: z.string() }),
  z.object({ type: z.literal("released"), from: z.string(), to: z.string() }),
]);

/**
 * Asks every other running bot process (the old pod during a rolling update, or a second
 * process started by hand) to drop its voice connections, and resolves once they all have,
 * or after HANDOVER_TIMEOUT_MS. Two processes rejoining the same channel otherwise keep
 * taking the voice session from each other until the old one exits.
 *
 * Also keeps answering later requests, so this process yields to whichever process starts
 * after it. Resolves immediately when no other process is subscribed, so a single process
 * (no Kubernetes, or the first rollout of this code) starts without waiting.
 */
export async function takeOverVoiceSessions(
  core: AppCore,
  redisUrl: string,
  releaseAll: () => Promise<void>,
): Promise<void> {
  let released = 0;
  let onReleased = () => {};

  await subscribeRedis(redisUrl, HANDOVER_CHANNEL, (raw) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    const message = HandoverMessageSchema.safeParse(parsed);
    if (!message.success || message.data.from === instanceId) {
      return;
    }

    if (message.data.type === "request") {
      const requester = message.data.from;
      void releaseAll()
        .catch((error) => console.error("[tts] failed to release voice sessions", error))
        .then(() =>
          core.state.redis.publish(
            HANDOVER_CHANNEL,
            JSON.stringify({ type: "released", from: instanceId, to: requester }),
          ),
        )
        .catch((error) => console.error("[tts] failed to acknowledge voice handover", error));
    } else if (message.data.to === instanceId) {
      released++;
      onReleased();
    }
  });

  // PUBLISH returns how many subscribers received it, this process included.
  const others =
    (await core.state.redis.publish(
      HANDOVER_CHANNEL,
      JSON.stringify({ type: "request", from: instanceId }),
    )) - 1;
  if (others <= 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      console.warn(`[tts] voice handover timed out (${released}/${others} released)`);
      resolve();
    }, HANDOVER_TIMEOUT_MS);
    onReleased = () => {
      if (released >= others) {
        clearTimeout(timeout);
        resolve();
      }
    };
    onReleased();
  });
}
