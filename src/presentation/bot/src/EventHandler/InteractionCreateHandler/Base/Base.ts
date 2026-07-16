import type { AppCore } from "app-core";
import {
  DiscordAPIError,
  RESTJSONErrorCodes,
  type BaseInteraction,
  type Message,
  type PermissionResolvable,
} from "discord.js";
import type { Guild, User } from "domain-model";

import { codeBlock } from "../../../utils/codeblock";
import { GuildParseError } from "./Error/GuildParseError";
import { PermissionError } from "./Error/PermissionError";
import { PermissionSuccess } from "./Permission/PermissionSuccess";

export abstract class Base<T extends BaseInteraction, R = void> {
  public readonly requireBotGuildPermissions: PermissionResolvable[] = [];
  public readonly requireBotChannelPermissions: PermissionResolvable[] = [];
  public readonly requireUserGuildPermissions: PermissionResolvable[] = [];

  constructor(protected readonly core: AppCore) {}

  protected async checkPermission(interaction: T) {
    if (!interaction.guild?.members.me?.permissions.has(this.requireBotGuildPermissions)) {
      return new PermissionError(
        [
          "このコマンドの実行にはボットに以下の権限が必要です。",
          await codeBlock(this.requireBotGuildPermissions.join(" ")),
          "サーバー権限が足りているのに実行できない場合はボット側のインテント設定が原因の可能性が高いです。",
        ].join("\n"),
      );
    }
    if (
      !interaction.channelId ||
      !interaction.guild?.members.me
        ?.permissionsIn(interaction.channelId)
        .has(this.requireBotChannelPermissions)
    ) {
      return new PermissionError(
        [
          "このコマンドの実行にはボットに以下のチャンネル権限が必要です。",
          await codeBlock(this.requireBotChannelPermissions.join(" ")),
          "チャンネル権限が足りているのに実行できない場合はボット側のインテント設定が原因の可能性が高いです。",
        ].join("\n"),
      );
    }
    if (!interaction.memberPermissions?.has(this.requireUserGuildPermissions)) {
      return new PermissionError(
        [
          "このコマンドの実行にはユーザーに以下の権限が必要です。",
          await codeBlock(this.requireUserGuildPermissions.join(" ")),
          "ユーザー権限が足りているのに実行できない場合はボット側のインテント設定が原因の可能性が高いです。",
        ].join("\n"),
      );
    }

    return new PermissionSuccess();
  }

  protected async messageExists(message: Message): Promise<boolean> {
    try {
      await message.fetch();
      return true;
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMessage) {
        return false;
      }
      throw error;
    }
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
      icon: guild.icon ?? undefined,
      banner: guild.banner ?? undefined,
    };
  }

  public abstract match(interaction: T): Promise<boolean>;

  public abstract run(interaction: T): Promise<R>;
}
