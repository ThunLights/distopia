import {
  MessageFlags,
  type InteractionReplyOptions,
  type Message,
  type ModalSubmitInteraction,
  type OmitPartialGroupDMChannel,
} from "discord.js";

import { Base, PermissionError } from "./Base";

export abstract class ModalSubmitInteractionBase<
  O extends {} = {},
  T extends ModalSubmitInteraction = ModalSubmitInteraction,
  R = InteractionReplyOptions | OmitPartialGroupDMChannel<Message>,
> extends Base<T, R> {
  public abstract readonly customId: string;

  public override async match(interaction: T): Promise<boolean> {
    return interaction.customId === this.customId;
  }

  public override async run(interaction: T): Promise<R> {
    const permission = await this.checkPermission(interaction);

    if (permission instanceof PermissionError) {
      return { content: permission.message, flags: [MessageFlags.Ephemeral] } as R;
    }

    const options = await this.parseOptions(interaction);

    return await this.exec(interaction, options);
  }

  public abstract parseOptions(interaction: T): Promise<O>;

  protected abstract exec(interaction: T, options: O): Promise<R>;
}
