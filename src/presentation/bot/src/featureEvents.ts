import type { AppCore } from "app-core";
import { features } from "app-feature-loader/bot";
import type { ClientEvents } from "discord.js";
import { SkipOtherProcess } from "presentation-bot-kit/feature";

export async function emitFeatureEvent<K extends keyof ClientEvents>(
  core: AppCore,
  event: K,
  ...args: ClientEvents[K]
): Promise<SkipOtherProcess | void> {
  for (const feature of features) {
    const listener = feature.events?.[event];
    if (!listener) {
      continue;
    }

    try {
      const result = await listener(core, ...args);
      if (result instanceof SkipOtherProcess) {
        return result;
      }
    } catch (error) {
      console.error(`[feature] ${event} listener failed`, error);
    }
  }
}
