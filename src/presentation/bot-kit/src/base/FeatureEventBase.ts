import type { AppCore } from "app-core";
import type { ClientEvents } from "discord.js";

import type { SkipOtherProcess } from "../feature";

// Higher runs first; equal priorities keep the loader's (alphabetical) feature order.
export const EventPriority = {
  // Gates everything else (e.g. anti-raid deleting spam, then returning SkipOtherProcess).
  Moderation: 100,
  Default: 0,
  // Records the outcome after other features have acted on the event.
  Logging: -100,
} as const;

export abstract class FeatureEventBase<K extends keyof ClientEvents = keyof ClientEvents> {
  public abstract readonly event: K;
  public readonly priority: number = EventPriority.Default;

  constructor(protected readonly core: AppCore) {}

  public abstract handle(...args: ClientEvents[K]): Promise<void | SkipOtherProcess>;
}
