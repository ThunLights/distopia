import type { AppCore } from "app-core";
import { features } from "app-feature-loader/bot";
import type { ClientEvents } from "discord.js";

export async function emitFeatureEvent<K extends keyof ClientEvents>(
  core: AppCore,
  event: K,
  ...args: ClientEvents[K]
): Promise<void> {
  for (const feature of features) {
    const listener = feature.events?.[event];
    if (!listener) {
      continue;
    }

    try {
      await listener(core, ...args);
    } catch (error) {
      console.error(`[feature] ${event} listener failed`, error);
    }
  }
}
