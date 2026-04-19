import type { BaseInteraction, Client } from "infra-discord/prelude";

import type { AppData } from "../../..";

export abstract class Base<T extends BaseInteraction, R = void> {
  constructor(
    protected readonly client: Client,
    protected readonly appData: AppData,
  ) {}

  public abstract match(interaction: T): Promise<boolean>;

  public abstract run(interaction: T): Promise<R>;
}
