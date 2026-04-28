import {
  MessageFlags,
  User,
  type MessageEditOptions,
  type MessagePayload,
  type UserSelectMenuInteraction,
} from "discord.js";

import { PermissionError } from "./Base";
import { ParseOptionsError } from "./Error/ParseOptionsError";
import { MessageComponentInteractionBase } from "./MessageComponentInteractionBase";

export abstract class UserSelectMenuInteractionBase<
  O extends { user: User } = { user: User },
  T extends UserSelectMenuInteraction = UserSelectMenuInteraction,
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
    const [userId] = interaction.values;

    if (!userId) {
      return new ParseOptionsError("ユーザーが選択されていません");
    }

    const user = interaction.client.users.cache.get(userId);

    if (!user) {
      return new ParseOptionsError("ユーザー情報が取得できませんでした");
    }

    return { user } as O;
  }

  protected abstract exec(interaction: T, options: O): Promise<R>;
}
