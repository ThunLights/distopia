import type {
  InteractionEditReplyOptions,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  MessageComponentInteraction,
  MessagePayload,
} from "discord.js";

import { Base } from "./Base";

export abstract class MessageComponentInteractionBase<
  T extends MessageComponentInteraction,
  R = string | InteractionReplyOptions | MessagePayload,
> extends Base<T, R> {
  public abstract readonly customId: string;

  public override async match(interaction: T): Promise<boolean> {
    return interaction.customId === this.customId;
  }

  protected async safeUpdate(
    interaction: T,
    options: string | MessagePayload | InteractionUpdateOptions,
  ): Promise<R> {
    if (!(await this.messageExists(interaction.message))) {
      return (await interaction.reply(options as InteractionReplyOptions)) as R;
    }

    return (await interaction.update(options)) as R;
  }

  protected async safeEditReply(
    interaction: T,
    options: string | MessagePayload | InteractionEditReplyOptions,
  ): Promise<void> {
    if (!(await this.messageExists(interaction.message))) {
      await interaction.followUp(options as InteractionReplyOptions);
      return;
    }

    await interaction.editReply(options);
  }
}
