import type { BaseInteraction, Client } from "shared-lib/discord.js";

import type { AppData } from "../../../model";

export abstract class Base<T extends BaseInteraction, R = void> {
  constructor(
    protected readonly client: Client,
    protected readonly appData: AppData,
  ) {}

  public abstract match(interaction: T): Promise<boolean>;

  public abstract run(interaction: T): Promise<R>;
}
