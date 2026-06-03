import {
  InteractionCallbackResponse,
  MessageFlags,
  type CommandInteraction,
  type InteractionReplyOptions,
  type MessagePayload,
} from "discord.js";

import { ValidateError, type ValidateResult } from "../../../utils/validator";
import { Base } from "./Base";
import { PermissionError } from "./Error/PermissionError";

export abstract class CommandInteractionBase<
  O extends {},
  T extends CommandInteraction,
  R = string | InteractionReplyOptions | MessagePayload | InteractionCallbackResponse<boolean>,
> extends Base<T, R> {
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
}
