import type { AppData } from "app-core/AppData";
import type { BaseInteraction } from "discord.js";
import type { Guild, User } from "domain-model";

export class GuildParseError extends Error {}

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
    };
  }

  public async parseGuild(interaction: T): Promise<Guild | GuildParseError> {
    const { guild } = interaction;
    if (!guild) {
      return new GuildParseError("サーバーでの権限かボットのインテントが足りません");
    }

    return {
      id: guild.id,
      name: guild.name,
      ownerId: guild.ownerId,
      description: guild.description ?? undefined,
      iconUrl: guild.iconURL() ?? undefined,
      bannerUrl: guild.bannerURL() ?? undefined,
    };
  }

  public abstract match(interaction: T): Promise<boolean>;

  public abstract run(interaction: T): Promise<R>;
}
