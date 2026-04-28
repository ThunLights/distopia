import {
  MessageFlags,
  type MessageEditOptions,
  type MessagePayload,
  type Role,
  type RoleSelectMenuInteraction,
} from "discord.js";

import { GuildParseError, PermissionError } from "./Base";
import { ParseOptionsError } from "./Error/ParseOptionsError";
import { MessageComponentInteractionBase } from "./MessageComponentInteractionBase";

export abstract class RoleSelectMenuInteractionBase<
  O extends { role: Role } = { role: Role },
  T extends RoleSelectMenuInteraction = RoleSelectMenuInteraction,
  R = string | MessagePayload | MessageEditOptions,
> extends MessageComponentInteractionBase<T, R> {
  public override async run(interaction: T): Promise<R> {
    const permission = await this.checkPermission(interaction);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] } as R;
    }

    const options = await this.parseOptions(interaction);

    if (options instanceof ParseOptionsError) {
      return {
        content: options.message,
        flags: [MessageFlags.Ephemeral],
      } as R;
    }

    return await this.exec(interaction, options);
  }

  public async parseOptions(interaction: T): Promise<O | ParseOptionsError> {
    const guild = await this.parseGuild(interaction);
    const [roleId] = interaction.values;

    if (guild instanceof GuildParseError) {
      return new ParseOptionsError(guild.message);
    }

    if (!roleId) {
      return new ParseOptionsError("ロールが選択されていません");
    }

    const role = interaction.client.guilds.cache.get(guild.id)?.roles.cache.get(roleId);

    if (!role) {
      return new ParseOptionsError("ロール情報が取得できませんでした");
    }

    return { role } as O;
  }

  protected abstract exec(interaction: T, options: O): Promise<R>;
}
