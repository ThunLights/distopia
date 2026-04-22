import type { AppCore } from "app-core";
import type { BaseInteraction, PermissionResolvable } from "discord.js";
import type { Guild, User } from "domain-model";

import { codeBlock } from "../../../utils/codeblock";

export class GuildParseError extends Error {}

export class PermissionSuccess {}

export class PermissionError extends Error {}

export abstract class Base<T extends BaseInteraction, R = void> {
  public readonly requireGuildPermissions: PermissionResolvable[] = [];
  public readonly requireChannelPermissions: PermissionResolvable[] = [];

  constructor(protected readonly core: AppCore) {}

  protected async checkPermission(interaction: T) {
    if (!interaction.guild?.members.me?.permissions.has(this.requireGuildPermissions)) {
      return new PermissionError(
        [
          "このコマンドの実行には以下の権限が必要です。",
          await codeBlock(this.requireGuildPermissions.join(" ")),
          "サーバー権限が足りているのに実行できない場合はボット側のインテント設定が原因の可能性が高いです。",
        ].join("\n"),
      );
    }
    if (
      interaction.channelId &&
      !interaction.guild?.members.me
        ?.permissionsIn(interaction.channelId)
        .has(this.requireChannelPermissions)
    ) {
      return new PermissionError(
        [
          "このコマンドの実行には以下の権限が必要です。",
          await codeBlock(this.requireChannelPermissions.join(" ")),
          "チャンネル権限が足りているのに実行できない場合はボット側のインテント設定が原因の可能性が高いです。",
        ].join("\n"),
      );
    }

    return new PermissionSuccess();
  }

  protected async parseUser(interaction: T): Promise<User> {
    const { user } = interaction;
    return {
      id: user.id,
      name: user.username,
      displayName: user.displayName,
      globalName: user.globalName ?? undefined,
      avatarUrl: user.avatarURL() ?? undefined,
      bannerUrl: user.bannerURL() ?? undefined,
    };
  }

  protected async parseGuild(interaction: T): Promise<Guild | GuildParseError> {
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
