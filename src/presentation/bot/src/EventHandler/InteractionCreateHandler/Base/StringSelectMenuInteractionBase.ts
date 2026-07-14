import {
  InteractionResponse,
  MessageFlags,
  type InteractionReplyOptions,
  type MessagePayload,
  type StringSelectMenuInteraction,
} from "discord.js";
import z from "zod";

import { ValidateError, validator, type ValidateResult } from "../../../utils/validator";
import { PermissionError } from "./Error/PermissionError";
import { MessageComponentInteractionBase } from "./MessageComponentInteractionBase";

export const OptionsSchema = z.object({
  value: z.string(),
});

export abstract class StringSelectMenuInteractionBase<
  Schema extends typeof OptionsSchema = typeof OptionsSchema,
  O extends z.infer<Schema> = z.infer<Schema>,
  T extends StringSelectMenuInteraction = StringSelectMenuInteraction,
  R = string | MessagePayload | InteractionReplyOptions | InteractionResponse,
> extends MessageComponentInteractionBase<T, R> {
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

  public async parseOptions(interaction: T): Promise<ValidateResult<O>> {
    const [value] = interaction.values;

    return (await validator({ value }, OptionsSchema)) as O;
  }

  protected abstract exec(interaction: T, options: O): Promise<R>;
}
