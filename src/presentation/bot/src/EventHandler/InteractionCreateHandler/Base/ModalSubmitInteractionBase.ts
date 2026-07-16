import {
  InteractionResponse,
  MessageFlags,
  type CacheType,
  type InteractionReplyOptions,
  type InteractionUpdateOptions,
  type MessagePayload,
  type ModalMessageModalSubmitInteraction,
  type ModalSubmitInteraction,
} from "discord.js";

import { ValidateError, type ValidateResult } from "../../../utils/validator";
import { Base } from "./Base";
import { PermissionError } from "./Error/PermissionError";

export abstract class ModalSubmitInteractionBase<
  O extends {} = {},
  T extends ModalSubmitInteraction = ModalSubmitInteraction,
  R = InteractionReplyOptions | InteractionResponse,
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

    if (options instanceof ValidateError) {
      return options.content as R;
    }

    return await this.exec(interaction, options);
  }

  public abstract parseOptions(interaction: T): Promise<ValidateResult<O>>;

  protected abstract exec(interaction: T, options: O): Promise<R>;

  protected async safeUpdate(
    interaction: ModalMessageModalSubmitInteraction<CacheType>,
    options: string | MessagePayload | InteractionUpdateOptions,
  ): Promise<R> {
    if (!(await this.messageExists(interaction.message))) {
      return (await interaction.reply(options as InteractionReplyOptions)) as R;
    }

    return (await interaction.update(options)) as R;
  }
}
