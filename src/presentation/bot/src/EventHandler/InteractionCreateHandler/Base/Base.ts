import type { AppData } from "app-core/AppData";
import type { BaseInteraction } from "discord.js";
import type { User } from "domain-model";

export abstract class Base<T extends BaseInteraction, R = void> {
  constructor(protected readonly appData: AppData) {}

  public async parseUser(interaction: T): Promise<User> {
    return {
      id: interaction.user.id,
      name: interaction.user.username,
      displayName: interaction.user.displayName,
      globalName: interaction.user.globalName ?? undefined,
      avatarUrl: interaction.user.avatarURL() ?? undefined,
      bannerUrl: interaction.user.bannerURL() ?? undefined,
    }
  }

  public abstract match(interaction: T): Promise<boolean>;

  public abstract run(interaction: T): Promise<R>;
}
