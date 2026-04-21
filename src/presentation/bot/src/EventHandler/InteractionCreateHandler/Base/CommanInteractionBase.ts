import type {
  CommandInteraction,
  InteractionReplyOptions,
  MessagePayload,
  PermissionResolvable,
} from "discord.js";

import { Base } from "./Base";

export abstract class CommandInteractionBase<
  O extends {},
  T extends CommandInteraction,
  R = string | InteractionReplyOptions | MessagePayload,
> extends Base<T, R> {
  public readonly requirePermissions: PermissionResolvable[] = [];

  public override async run(interaction: T): Promise<R> {
    const options = await this.parseOptions(interaction);
    return await this.exec(interaction, options);
  }

  public abstract parseOptions(interaction: T): Promise<O>;

  protected abstract exec(interaction: T, options: O): Promise<R>;
}
