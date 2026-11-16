import type { AppCore } from "app-core";
import type { ClientEvents } from "discord.js";

import type { SkipOtherProcess } from "../feature";

export abstract class FeatureEventBase<K extends keyof ClientEvents = keyof ClientEvents> {
  public abstract readonly event: K;

  constructor(protected readonly core: AppCore) {}

  public abstract handle(...args: ClientEvents[K]): Promise<void | SkipOtherProcess>;
}
