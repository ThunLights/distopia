import type { BaseInteraction, Client } from "infra-discord/prelude";

import type { Appdata } from "../../../model";

export abstract class Base<T extends BaseInteraction, R = void> {
  constructor(
    protected readonly client: Client,
    protected readonly appData: Appdata,
  ) {}

  public abstract match(interaction: T): Promise<boolean>;

  public abstract run(interaction: T): Promise<R>;
}
