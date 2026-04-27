import {
  Message,
  MessageFlags,
  type ButtonInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
  type OmitPartialGroupDMChannel,
} from "discord.js";

import { PermissionError } from "./Base";
import { MessageComponentInteractionBase } from "./MessageComponentInteractionBase";

export abstract class ButtonInteractionBase<
  T extends ButtonInteraction = ButtonInteraction,
  R = string | InteractionReplyOptions | MessagePayload | OmitPartialGroupDMChannel<Message>,
> extends MessageComponentInteractionBase<T, R> {
  public override async run(interaction: T): Promise<R> {
    const permission = await this.checkPermission(interaction);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] } as R;
    }

    return await this.exec(interaction);
  }

  protected abstract exec(interaction: T): Promise<R>;
}
