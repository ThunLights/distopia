import type { AppCore } from "app-core";
import { features } from "app-feature-loader/bot";
import type { ClientEvents } from "discord.js";
import type { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";
import { SkipOtherProcess } from "presentation-bot-kit/feature";

const listenersByCore = new WeakMap<AppCore, FeatureEventBase[]>();

function listenersFor(core: AppCore): FeatureEventBase[] {
  let listeners = listenersByCore.get(core);
  if (!listeners) {
    listeners = features
      .flatMap((f) => f.events ?? [])
      .map((Listener) => new Listener(core))
      .sort((a, b) => b.priority - a.priority);
    listenersByCore.set(core, listeners);
  }
  return listeners;
}

export async function emitFeatureEvent<K extends keyof ClientEvents>(
  core: AppCore,
  event: K,
  ...args: ClientEvents[K]
): Promise<SkipOtherProcess | void> {
  for (const listener of listenersFor(core)) {
    if (listener.event !== event) {
      continue;
    }

    try {
      const result = await (listener as FeatureEventBase<K>).handle(...args);
      if (result instanceof SkipOtherProcess) {
        return result;
      }
    } catch (error) {
      console.error(`[feature] ${event} listener failed`, error);
    }
  }
}
