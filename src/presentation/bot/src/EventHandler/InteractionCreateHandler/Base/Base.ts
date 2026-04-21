import type { AppData } from "app-core/AppData";
import type { BaseInteraction } from "discord.js";

export abstract class Base<T extends BaseInteraction, R = void> {
  constructor(protected readonly appData: AppData) {}

  public abstract match(interaction: T): Promise<boolean>;

  public abstract run(interaction: T): Promise<R>;
}
