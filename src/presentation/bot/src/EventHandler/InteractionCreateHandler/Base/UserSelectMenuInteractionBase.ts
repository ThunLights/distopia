import {
  Message,
  MessageFlags,
  type InteractionReplyOptions,
  type MessagePayload,
  type OmitPartialGroupDMChannel,
  type UserSelectMenuInteraction,
} from "discord.js";

import { ParseOptionsError } from "./Error/ParseOptionsError";
import { PermissionError } from "./Error/PermissionError";
import { MessageComponentInteractionBase } from "./MessageComponentInteractionBase";

export abstract class UserSelectMenuInteractionBase<
  O extends { userId: string } = { userId: string },
  T extends UserSelectMenuInteraction = UserSelectMenuInteraction,
  R = string | MessagePayload | InteractionReplyOptions | OmitPartialGroupDMChannel<Message>,
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

    return { userId } as O;
  }

  protected abstract exec(interaction: T, options: O): Promise<R>;
}
