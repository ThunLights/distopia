import {
  MessageFlags,
  type InteractionReplyOptions,
  type Message,
  type MessagePayload,
  type OmitPartialGroupDMChannel,
  type StringSelectMenuInteraction,
} from "discord.js";

import { ParseOptionsError } from "./Error/ParseOptionsError";
import { PermissionError } from "./Error/PermissionError";
import { MessageComponentInteractionBase } from "./MessageComponentInteractionBase";

export abstract class StringSelectMenuInteractionBase<
  O extends { value: string } = { value: string },
  T extends StringSelectMenuInteraction = StringSelectMenuInteraction,
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
    const [value] = interaction.values;

    if (!value) {
      return new ParseOptionsError("選択されていません");
    }

    return { value } as O;
  }

  protected abstract exec(interaction: T, options: O): Promise<R>;
}
